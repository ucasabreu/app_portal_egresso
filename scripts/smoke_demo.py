"""Valida a demonstração em execução usando apenas a biblioteca padrão Python."""
import argparse
import json
import uuid
from urllib.error import HTTPError
from urllib.request import Request, build_opener, HTTPCookieProcessor
from http.cookiejar import CookieJar
from criar_destaques_demo import default_url


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default=default_url())
    args = parser.parse_args()
    base = args.base_url.rstrip('/')
    opener = build_opener(HTTPCookieProcessor(CookieJar()))

    def request(path, method='GET', data=None, expected=200):
        body = json.dumps(data).encode() if data is not None else None
        headers = {'Content-Type': 'application/json'}
        if method not in ('GET', 'HEAD', 'OPTIONS'):
            headers['X-CSRF-TOKEN'] = request('/api/auth/csrf')['token']
        req = Request(base + path, data=body, method=method, headers=headers)
        try:
            response = opener.open(req, timeout=15)
        except HTTPError as error:
            response = error
        with response:
            content = response.read().decode()
            if response.code != expected:
                raise AssertionError(f'{method} {path}: esperado {expected}, recebido {response.code}: {content}')
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return content

    homepage = request('/')
    assert 'id="root"' in homepage, 'Frontend não retornou a aplicação React.'
    assert request('/api/demo/health')['status'] == 'ok'
    request('/api/auth/me', expected=401)
    for login, role in [('coord.demo', 'coordenador'), ('admin.demo', 'geral')]:
        account = request('/api/auth/login', 'POST', {'login': login, 'senha': 'demo123'})
        assert account['role'] == role and 'senha' not in account
        assert request('/api/auth/me')['id'] == account['id']
        assert request('/api/gestao/painel')['coordenador']['id_coordenador'] == account['id']
    request('/api/auth/login', 'POST', {'login': 'admin.demo', 'senha': 'errada'}, expected=401)
    datasets = {name: request('/api/consultas/listar/' + name)
                for name in ['cursos', 'egressos', 'depoimentos', 'cargos', 'coordenadores']}
    assert all(datasets.values()), 'Faltam dados de demonstração.'
    assert request('/api/coordenadores/destaque/listar'), 'Faltam destaques de demonstração.'
    assert 'id="root"' in request('/destaques'), 'A página de destaques não retornou a SPA.'
    profile = {'nome': 'Pessoa Teste Smoke', 'email': f'smoke-{uuid.uuid4().hex}@example.com',
               'descricao': 'Registro temporário de validação', 'foto': '/demo/avatar.svg',
               'linkedin': '', 'instagram': '', 'curriculo': '/demo/curriculo.html'}
    created = request('/api/egressos/salvar/egresso', 'POST', profile, 201)
    identifier = created['id_egresso']
    deleted = False
    temporary_course = None
    try:
        request(f'/api/egressos/salvar/egresso/{identifier}/salvar_depoimento', 'POST',
                {'texto': 'Depoimento temporário de validação'}, 201)
        request(f'/api/egressos/salvar/egresso/{identifier}/salvar_cargo', 'POST',
                {'descricao': 'Desenvolvimento', 'local': 'Empresa Teste', 'ano_inicio': 2023, 'ano_fim': 2024}, 201)
        course = datasets['cursos'][0]['id_curso']
        request(f'/api/egressos/salvar/egresso/{identifier}/curso/{course}/curso_egresso', 'POST',
                {'ano_inicio': 2018, 'ano_fim': 2022}, 201)
        for resource in ['depoimentos', 'cargos', 'cursos_egresso']:
            assert request(f'/api/egressos/egresso/{identifier}/{resource}')
        coordinator = next(item['id_coordenador'] for item in datasets['coordenadores'] if item['login'] == 'coord.demo')
        request(f'/api/coordenadores/{coordinator}/egresso/{identifier}/destaque', 'POST',
                {'titulo': 'Conquista Exemplo', 'noticia': 'Notícia temporária de validação',
                 'feitoDestaque': 'Projeto de demonstração'}, 201)
        story = request(f'/api/coordenadores/destaque/egresso/{identifier}')[0]
        edited = request(f"/api/coordenadores/atualizar/destaque/{story['id']}", 'PUT',
                         {'titulo': 'Conquista Atualizada', 'noticia': 'Conteúdo revisado', 'feitoDestaque': 'Projeto atualizado'})
        assert edited['titulo'] == 'Conquista Atualizada'
        assert edited['egresso']['id_egresso'] == identifier and edited['dataPublicacao'] == story['dataPublicacao']
        suffix = ''.join(chr(ord('a') + int(character, 16)) for character in uuid.uuid4().hex)
        admin_id = account['id']
        temporary_course = request('/api/coordenadores/salvar/curso', 'POST',
                                   {'nome': 'Curso Smoke ' + suffix, 'nivel': 'Graduação', 'id_coordenador': admin_id}, 201)['id_curso']
        updated_course = request(f'/api/coordenadores/atualizar/curso/{temporary_course}', 'PUT',
                                 {'nome': 'Curso Revisado ' + suffix, 'nivel': 'Especialização', 'id_coordenador': coordinator})
        assert updated_course['nivel'] == 'Especialização' and updated_course['coordenador']['id_coordenador'] == coordinator
        draft_values = {'id_egresso': identifier, 'titulo': 'Rascunho Smoke'}
        draft = request('/api/gestao/rascunhos', 'POST', draft_values, 201)
        draft_path = '/api/gestao/rascunhos/' + str(draft['id'])
        assert request(draft_path)['versao'] == draft['versao']
        request(draft_path + '/publicar', 'POST', {'versao': draft['versao']}, expected=400)
        draft_values.update(noticia='Texto completo do rascunho', feitoDestaque='Projeto temporário', versao=draft['versao'])
        current = request(draft_path, 'PUT', draft_values)
        request(draft_path, 'PUT', draft_values, expected=409)
        request('/api/auth/logout', 'POST', expected=204)
        request('/api/auth/login', 'POST', {'login': 'coord.demo', 'senha': 'demo123'})
        request(draft_path, expected=403)
        request(f'/api/egressos/atualizar/egresso/{identifier}', 'PUT', profile, expected=403)
        request('/api/auth/logout', 'POST', expected=204)
        request('/api/auth/login', 'POST', {'login': 'admin.demo', 'senha': 'demo123'})
        assert request(draft_path)['versao'] == current['versao'], 'Rascunho não persistiu após nova sessão.'
        published = request(draft_path + '/publicar', 'POST', {'versao': current['versao']}, 201)
        assert request('/api/coordenadores/buscar/destaque/' + str(published['id']))['titulo'] == 'Rascunho Smoke'
        request(draft_path, expected=404)
        profile['nome'] = 'Pessoa Atualizada Smoke'
        updated = request(f'/api/egressos/atualizar/egresso/{identifier}', 'PUT', profile)
        assert updated['nome'] == profile['nome']
        assert request(f'/api/egressos/buscar/egresso/{identifier}')['nome'] == profile['nome']
        assert 'id="root"' in request(f'/egresso_view/{identifier}'), 'Rota interna não retornou a SPA.'
        assert '<svg' in request('/demo/avatar.svg')
        assert 'Currículo de demonstração' in request('/demo/curriculo.html')
        request(f'/api/egressos/deletar/egresso/{identifier}', 'DELETE', expected=204)
        deleted = True
        request(f'/api/egressos/buscar/egresso/{identifier}', expected=400)
        assert not any(item['egresso']['id_egresso'] == identifier
                       for item in request('/api/coordenadores/destaque/listar'))
    finally:
        # Retoma a conta de gestão também quando um teste intermediário falha.
        request('/api/auth/login', 'POST', {'login': 'admin.demo', 'senha': 'demo123'})
        if not deleted:
            request(f'/api/egressos/deletar/egresso/{identifier}', 'DELETE', expected=204)
        if temporary_course is not None:
            request(f'/api/coordenadores/deletar/curso/{temporary_course}', 'DELETE', expected=204)
    assert request('/api/publico/egressos?tamanho=2')['size'] == 2
    assert request('/api/publico/destaques?tamanho=2')['size'] == 2
    request('/api/coordenadores/buscar/destaque/999999999', expected=404)
    request('/api/auth/logout', 'POST', expected=204)
    request('/api/auth/me', expected=401)
    print('OK: frontend, proxy, sessões, permissões, paginação, consultas, edição e rascunhos persistentes com conflitos e publicação.')


if __name__ == '__main__':
    main()
