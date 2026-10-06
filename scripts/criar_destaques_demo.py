"""Publica histórias fictícias pela API demo sem modificar registros existentes."""
import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, HTTPCookieProcessor
from http.cookiejar import CookieJar
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'scripts/demo/destaques.json'


def default_url():
    port = os.environ.get('PORTAL_FRONTEND_PORT')
    if port is None and (ROOT / '.env').exists():
        for line in (ROOT / '.env').read_text(encoding='utf-8-sig').splitlines():
            key, separator, value = line.partition('=')
            if separator and key.strip() == 'PORTAL_FRONTEND_PORT':
                port = value.strip().strip('\"\'')
                break
    port = port or '5173'
    if not port.isdecimal() or not 1 <= int(port) <= 65535:
        raise ValueError('PORTAL_FRONTEND_PORT deve conter uma porta entre 1 e 65535.')
    return 'http://localhost:' + port


class Api:
    def __init__(self, base):
        parsed = urlsplit(base)
        if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.query or parsed.fragment:
            raise ValueError('Informe o endereço HTTP(S) da aplicação, sem consulta ou fragmento.')
        self.base = base.rstrip('/')
        self.opener = build_opener(HTTPCookieProcessor(CookieJar()))
        self.token = None

    def login(self, login='admin.demo', senha='demo123'):
        health = self('/api/demo/health')
        if not isinstance(health, dict) or health.get('mode') != 'demo':
            raise RuntimeError('Este comando exige a demonstração do Portal.')
        user = self('/api/auth/login', 'POST', {'login': login, 'senha': senha}, expected=200)
        self.token = None
        return user

    def __call__(self, path, method='GET', data=None, json_response=True, expected=None):
        headers = {'Content-Type': 'application/json'}
        if method not in ('GET', 'HEAD', 'OPTIONS'):
            if self.token is None:
                self.token = self('/api/auth/csrf')['token']
            headers['X-CSRF-TOKEN'] = self.token
        body = json.dumps(data, ensure_ascii=False).encode() if data is not None else None
        request = Request(self.base + path, data=body, method=method, headers=headers)
        try:
            with self.opener.open(request, timeout=20) as response:
                text = response.read().decode('utf-8')
                expected = expected if expected is not None else 201 if method == 'POST' else 200
                if response.status != expected:
                    raise RuntimeError(f'{method} {path}: esperado HTTP {expected}, recebido {response.status}.')
        except HTTPError as error:
            detail = error.read().decode('utf-8', errors='replace')[:250]
            raise RuntimeError(f'{method} {path}: HTTP {error.code}. {detail}') from error
        except (URLError, OSError) as error:
            raise RuntimeError(f'Não foi possível acessar {self.base}. Confira os containers e a porta: {error}') from error
        if expected == 204:
            return None
        if not json_response:
            return text
        try:
            return json.loads(text)
        except json.JSONDecodeError as error:
            raise RuntimeError(f'{path} não retornou JSON. Confira o endereço da aplicação e o proxy da API.') from error


def collection(request, path):
    records = request(path)
    if not isinstance(records, list):
        raise RuntimeError(f'A consulta {path} não retornou uma lista.')
    return records


def record_id(record, key):
    value = record.get(key)
    if isinstance(value, bool) or not str(value).isdecimal() or int(value) < 1:
        raise RuntimeError(f'O serviço não retornou um {key} válido.')
    return int(value)


def publish(request, stories, dry_run=False):
    health = request('/api/demo/health')
    if not isinstance(health, dict) or health.get('mode') != 'demo' or health.get('status') != 'ok':
        raise RuntimeError('Este comando exige o Portal com o perfil demo saudável.')
    coordinators = collection(request, '/api/consultas/listar/coordenadores')
    coordinator = next((person for person in coordinators if person.get('login') == 'coord.demo'), None)
    if coordinator is None:
        raise RuntimeError('A conta coord.demo não foi encontrada; nenhum destaque foi criado.')
    coordinator_id = record_id(coordinator, 'id_coordenador')
    graduates = collection(request, '/api/consultas/listar/egressos')
    people = {person.get('email', '').casefold(): person for person in graduates}
    existing = collection(request, '/api/coordenadores/destaque/listar')
    existing_keys = {(item.get('titulo'), str((item.get('egresso') or {}).get('id_egresso')),
                      str((item.get('coordenador') or {}).get('id_coordenador'))) for item in existing}
    # Resolve every profile and cover before performing the first write.
    plan = []
    for story in stories:
        person = people.get(story['email'].casefold())
        if person is None:
            raise RuntimeError(f"O perfil demo {story['email']} não foi encontrado; nenhum destaque foi criado.")
        person_id = record_id(person, 'id_egresso')
        key = (story['titulo'], str(person_id), str(coordinator_id))
        if key in existing_keys:
            plan.append((story, person_id, None))
            continue
        try:
            cover = request(story['imagem'], json_response=False)
            if ET.fromstring(cover).tag != '{http://www.w3.org/2000/svg}svg':
                raise ValueError('A resposta não é uma imagem SVG.')
        except (ET.ParseError, ValueError, RuntimeError) as error:
            raise RuntimeError('Uma capa não está disponível. Reconstrua o frontend antes de publicar: '
                               + story['imagem']) from error
        payload = {key: story[key] for key in ('titulo', 'feitoDestaque', 'imagem')}
        payload['noticia'] = story['noticia'].replace('{nome}', person['nome'])
        plan.append((story, person_id, payload))
    created = skipped = 0
    for story, person_id, payload in plan:
        if payload is None:
            skipped += 1
            print('Já existe: ' + story['titulo'])
        elif dry_run:
            print('Prévia: ' + story['titulo'])
        else:
            saved = request(f'/api/coordenadores/{coordinator_id}/egresso/{person_id}/destaque',
                            method='POST', data=payload)
            created += 1
            print(f"Criado: {story['titulo']} → /destaques/{record_id(saved, 'id')}")
    return {'created': created, 'skipped': skipped, 'planned': len(plan) - skipped}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', help='Endereço do frontend; por padrão, usa PORTAL_FRONTEND_PORT de .env ou 5173.')
    parser.add_argument('--dry-run', action='store_true', help='Confere API, perfis e capas sem publicar.')
    args = parser.parse_args()
    try:
        base = args.base_url or default_url()
        api = Api(base)
        api.login()
        try:
            result = publish(api, json.loads(CATALOG.read_text(encoding='utf-8')), args.dry_run)
        finally:
            try:
                api('/api/auth/logout', 'POST', expected=204)
            except RuntimeError as error:
                print('Não foi possível encerrar a sessão demo: ' + str(error), file=sys.stderr)
        if args.dry_run:
            print(f"Prévia concluída: {result['planned']} publicações disponíveis para criação; nenhuma gravação.")
        else:
            print(f"Concluído: {result['created']} destaques criados; {result['skipped']} já existentes.")
            print('Confira ' + base.rstrip('/') + '/destaques e atualize a página inicial.')
    except (RuntimeError, ValueError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
