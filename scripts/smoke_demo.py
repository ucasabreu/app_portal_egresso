"""Valida a demonstração em execução usando apenas a biblioteca padrão Python."""
import argparse
import json
import uuid
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://localhost:5173')
    args = parser.parse_args()
    base = args.base_url.rstrip('/')

    def request(path, method='GET', data=None, expected=200):
        body = json.dumps(data).encode() if data is not None else None
        req = Request(base + path, data=body, method=method,
                      headers={'Content-Type': 'application/json'})
        try:
            response = urlopen(req, timeout=15)
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
    for login, role in [('admin.demo', 'geral'), ('coord.demo', 'coordenador')]:
        account = request('/api/coordenadores/buscar/coordenador?' + urlencode({'login': login, 'senha': 'demo123'}))
        assert account['tipo'] == role and 'senha' not in account
    request('/api/coordenadores/buscar/coordenador?' + urlencode({'login': 'admin.demo', 'senha': 'errada'}), expected=400)
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
        coordinator = datasets['coordenadores'][0]['id_coordenador']
        request(f'/api/coordenadores/{coordinator}/egresso/{identifier}/destaque', 'POST',
                {'titulo': 'Conquista Exemplo', 'noticia': 'Notícia temporária de validação',
                 'feitoDestaque': 'Projeto de demonstração'}, 201)
        assert request(f'/api/coordenadores/destaque/egresso/{identifier}')
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
        if not deleted:
            request(f'/api/egressos/deletar/egresso/{identifier}', 'DELETE', expected=204)
    print('OK: frontend, proxy, rotas, saúde, duas contas, consultas, destaques e CRUD com vínculos.')


if __name__ == '__main__':
    main()
