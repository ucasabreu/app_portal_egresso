"""Verifica a publicação de exemplos sem depender de containers ou banco real."""
import contextlib
import copy
import importlib.util
import io
from unittest.mock import Mock
import json
import os
from pathlib import Path
import re
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('demo_highlights', ROOT / 'scripts/criar_destaques_demo.py')
demo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(demo)
STORIES = json.loads(demo.CATALOG.read_text(encoding='utf-8'))


class DemoApi:
    def __init__(self):
        self.calls = []
        self.health = {'mode': 'demo', 'status': 'ok'}
        self.people = [
            {'id_egresso': index + 101, 'email': email, 'nome': 'Nome atual ' + str(index)}
            for index, email in enumerate(dict.fromkeys(story['email'] for story in STORIES))
        ]
        self.records = []
        self.missing_cover = None
        self.fail_post = None

    def __call__(self, path, method='GET', data=None, json_response=True):
        self.calls.append((method, path, data))
        if method == 'POST':
            match = re.fullmatch(r'/api/coordenadores/(\d+)/egresso/(\d+)/destaque', path)
            if match is None:
                raise AssertionError('Endpoint de publicação inesperado: ' + path)
            if self.fail_post == len(self.records) + 1:
                raise RuntimeError('Falha temporária de gravação')
            saved = {**data, 'id': len(self.records) + 501,
                     'egresso': {'id_egresso': int(match[2])},
                     'coordenador': {'id_coordenador': int(match[1])}}
            self.records.append(saved)
            return saved
        if not json_response:
            if path == self.missing_cover:
                raise RuntimeError('HTTP 404')
            return (ROOT / 'frontend/public' / path.lstrip('/')).read_text(encoding='utf-8')
        return {
            '/api/demo/health': self.health,
            '/api/consultas/listar/coordenadores': [{'login': 'coord.demo', 'id_coordenador': 42}],
            '/api/consultas/listar/egressos': self.people,
            '/api/coordenadores/destaque/listar': self.records,
        }[path]

    @property
    def posts(self):
        return [call for call in self.calls if call[0] == 'POST']


class DemoHighlightsTest(unittest.TestCase):
    def publish(self, api, dry_run=False):
        with contextlib.redirect_stdout(io.StringIO()):
            return demo.publish(api, copy.deepcopy(STORIES), dry_run)

    def test_resolves_current_profiles_and_creates_six_articles(self):
        api = DemoApi()
        self.assertEqual(self.publish(api), {'created': 6, 'skipped': 0, 'planned': 6})
        for story, (_, path, payload) in zip(STORIES, api.posts):
            person = next(person for person in api.people if person['email'] == story['email'])
            self.assertEqual(path, f"/api/coordenadores/42/egresso/{person['id_egresso']}/destaque")
            self.assertEqual(set(payload), {'titulo', 'feitoDestaque', 'noticia', 'imagem'})
            self.assertIn(person['nome'], payload['noticia'])
            self.assertNotIn('{nome}', payload['noticia'])
        self.assertTrue(all(method in ('GET', 'POST') for method, *_ in api.calls))

    def test_repeated_execution_preserves_existing_edits(self):
        api = DemoApi()
        self.publish(api)
        api.records[0]['noticia'] = 'Texto editado pelo coordenador'
        preserved = copy.deepcopy(api.records)
        api.calls.clear()
        self.assertEqual(self.publish(api), {'created': 0, 'skipped': 6, 'planned': 0})
        self.assertEqual(api.posts, [])
        self.assertEqual(api.records, preserved)

    def test_missing_profile_prevents_all_writes(self):
        api = DemoApi()
        api.people = [person for person in api.people if person['email'] != 'diego@example.com']
        with self.assertRaisesRegex(RuntimeError, 'nenhum destaque foi criado'):
            self.publish(api)
        self.assertEqual(api.posts, [])

    def test_missing_cover_prevents_all_writes_and_explains_rebuild(self):
        api = DemoApi()
        api.missing_cover = STORIES[-1]['imagem']
        with self.assertRaisesRegex(RuntimeError, 'Reconstrua o frontend'):
            self.publish(api)
        self.assertEqual(api.posts, [])

    def test_dry_run_checks_all_covers_without_writing(self):
        api = DemoApi()
        self.assertEqual(self.publish(api, dry_run=True), {'created': 0, 'skipped': 0, 'planned': 6})
        self.assertEqual(api.posts, [])
        self.assertEqual(len([path for _, path, _ in api.calls if path.endswith('.svg')]), 6)

    def test_rejects_wrong_application_or_unhealthy_demo(self):
        for health in [{'mode': 'production', 'status': 'ok'}, {'mode': 'demo', 'status': 'starting'}, []]:
            with self.subTest(health=health):
                api = DemoApi()
                api.health = health
                with self.assertRaisesRegex(RuntimeError, 'perfil demo saudável'):
                    self.publish(api)
                self.assertEqual(len(api.calls), 1)

    def test_retry_after_partial_failure_does_not_duplicate_created_articles(self):
        api = DemoApi()
        api.fail_post = 3
        with self.assertRaisesRegex(RuntimeError, 'Falha temporária'):
            self.publish(api)
        self.assertEqual(len(api.records), 2)
        api.fail_post = None
        self.assertEqual(self.publish(api), {'created': 4, 'skipped': 2, 'planned': 4})
        self.assertEqual(len(api.records), 6)

    def test_catalog_is_fictional_and_meets_api_limits_with_self_contained_covers(self):
        self.assertEqual(len(STORIES), 6)
        self.assertEqual(len({story['titulo'] for story in STORIES}), 6)
        for story in STORIES:
            with self.subTest(story=story['key']):
                self.assertLessEqual(len(story['titulo']), 100)
                self.assertRegex(story['titulo'], r'^[A-Za-zÀ-ÿ0-9\s]+$')
                self.assertLessEqual(len(story['feitoDestaque']), 255)
                self.assertIn('fictício', story['feitoDestaque'])
                self.assertIn('fictício', story['noticia'])
                svg = ET.parse(ROOT / 'frontend/public' / story['imagem'].lstrip('/')).getroot()
                self.assertEqual(svg.tag, '{http://www.w3.org/2000/svg}svg')
                self.assertEqual(svg.get('viewBox'), '0 0 1200 675')
                self.assertFalse(any(element.tag.endswith('script') for element in svg.iter()))
                for element in svg.iter():
                    for attribute, value in element.attrib.items():
                        if attribute.endswith('href'):
                            self.assertTrue(value.startswith('#'))

    def test_default_url_reads_project_port_and_environment_takes_precedence(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '.env').write_text('PORTAL_FRONTEND_PORT=5180\n', encoding='utf-8')
            with patch.object(demo, 'ROOT', root), patch.dict(os.environ, {}, clear=True):
                self.assertEqual(demo.default_url(), 'http://localhost:5180')
                with patch.dict(os.environ, {'PORTAL_FRONTEND_PORT': '5181'}):
                    self.assertEqual(demo.default_url(), 'http://localhost:5181')
                with patch.dict(os.environ, {'PORTAL_FRONTEND_PORT': '70000'}):
                    with self.assertRaises(ValueError):
                        demo.default_url()
                (root / '.env').unlink()
                self.assertEqual(demo.default_url(), 'http://localhost:5173')


class DemoSessionTest(unittest.TestCase):
    def response(self, status, payload):
        response = Mock(status=status)
        response.read.return_value = json.dumps(payload).encode() if payload is not None else b''
        response.__enter__ = Mock(return_value=response)
        response.__exit__ = Mock(return_value=False)
        return response

    def test_login_refreshes_csrf_and_logout_accepts_empty_response(self):
        api = demo.Api('http://localhost:5180')
        api.opener = Mock()
        api.opener.open.side_effect = [
            self.response(200, {'mode': 'demo'}), self.response(200, {'token': 'before'}),
            self.response(200, {'role': 'geral', 'id': 1}), self.response(200, {'token': 'after'}),
            self.response(201, {'id': 5}), self.response(204, None),
        ]
        self.assertEqual(api.login()['role'], 'geral')
        self.assertIsNone(api.token)
        self.assertEqual(api('/api/gestao/rascunhos', 'POST', {'titulo': 'Exemplo'})['id'], 5)
        self.assertIsNone(api('/api/auth/logout', 'POST', expected=204))
        calls = [call.args[0] for call in api.opener.open.call_args_list]
        self.assertEqual(calls[2].get_header('X-csrf-token'), 'before')
        self.assertEqual(calls[4].get_header('X-csrf-token'), 'after')
        self.assertEqual(calls[5].get_header('X-csrf-token'), 'after')
        self.assertEqual(len(calls), 6)

    def test_login_refuses_non_demo_environment_before_sending_credentials(self):
        api = demo.Api('http://localhost:5180')
        api.opener = Mock()
        for health in [{'mode': 'production'}, []]:
            with self.subTest(health=health):
                api.opener.reset_mock()
                api.opener.open.return_value = self.response(200, health)
                with self.assertRaisesRegex(RuntimeError, 'exige a demonstração'):
                    api.login()
                self.assertEqual(api.opener.open.call_count, 1)

    def test_logout_failure_does_not_hide_original_publication_error(self):
        api = Mock()
        api.side_effect = RuntimeError('Falha ao sair')
        stderr = io.StringIO()
        with patch.object(demo, 'Api', return_value=api), patch.object(demo, 'publish', side_effect=RuntimeError('Falha principal')), patch.object(demo.sys, 'argv', ['criar_destaques_demo.py', '--base-url', 'http://localhost:5180']), contextlib.redirect_stderr(stderr):
            with self.assertRaises(SystemExit) as error:
                demo.main()
        self.assertEqual(error.exception.code, 1)
        self.assertIn('Falha principal', stderr.getvalue())
        self.assertIn('Falha ao sair', stderr.getvalue())


if __name__ == '__main__':
    unittest.main()
