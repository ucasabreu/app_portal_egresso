# Plano de melhoria do frontend — Portal de Egressos

## Objetivo e escopo

Transformar o portal em uma apresentação de portfólio com identidade visual consistente, navegação clara, uso confortável no celular e código fácil de manter. Cobrir consulta pública, cadastro e edição, trajetória dos egressos, depoimentos, destaques, login e painéis de coordenação.

Branch de trabalho: `feat/frontend-redesign`, baseada na `main` local no commit `b74695b`. Manter React 19, Vite, JavaScript e as dependências travadas do projeto. Preservar URLs, contratos da API e os inicializadores de demonstração. Este plano não autoriza uma migração de framework ou mudanças no modelo de dados.

O planejamento fica neste documento de desenvolvimento. O README continua dedicado à apresentação do software, execução e capturas reais.

## Diagnóstico verificado

Análise estática realizada em 06/10/2026. A auditoria no navegador e a medição de qualidade ainda precisam ser executadas; os pontos abaixo são evidências do código, não resultados visuais medidos.

| Evidência | Impacto e ação |
| --- | --- |
| 23 arquivos JSX e 19 CSS; nenhum `@media` nos CSS examinados | Criar layout fluido e adaptações explícitas para navegação, cards, formulários e tabelas. |
| Header com altura de 200 px, margens amplas e espaçamento lateral de 150 px | Reduzir o cabeçalho e usar contêiner central com largura máxima e margens fluidas. |
| Seletores globais como `body`, `input`, `.header` e `.title` em CSS de páginas | Isolar estilos de componentes e impedir interferências entre rotas. |
| `Button.jsx` recebe `props` como objeto separado | Repassar atributos nativos, incluindo `type`, `disabled`, `className` e atributos acessíveis. |
| 31 chamadas a `alert()` | Substituir mensagens bloqueantes por feedback contextual e confirmação acessível para exclusões. |
| Uma rota `/edit-egresso/:id` duplicada em `App.jsx` | Manter uma definição e adicionar tratamento de rota inexistente. |
| Cinco efeitos independentes de pesquisa em `EgressosPage.jsx` | Coordenar filtros e impedir que respostas antigas sobrescrevam buscas recentes. |
| Cards da listagem usam `egresso.id`, mas navegam com `id_egresso` | Uniformizar identificadores e chaves com o contrato real. |
| Menu e cards usam `span`, `div` e `li` clicáveis | Usar links e botões navegáveis por teclado. |
| Home impõe dois segundos de espera; existem placeholders externos e caminhos locais ausentes | Derivar carregamento da requisição e usar fallback local existente. |

## Direção visual proposta

Adotar uma linguagem institucional contemporânea: azul profundo, turquesa, superfícies claras e destaque para pessoas e trajetórias. Esta é uma proposta inicial enquanto a preferência visual do autor não for confirmada.

| Elemento | Proposta |
| --- | --- |
| Cores | Azul `#17324D` para hierarquia; turquesa escuro `#087F8C` para ações; fundo `#F5F7FA`; superfície branca; texto `#172B3A`. Validar combinações antes do uso. |
| Tipografia | Uma família sans-serif para interface, títulos com peso e escala claros; corpo a partir de 16 px. Começar com fontes de sistema e avaliar manter Dosis somente onde funcionar bem. |
| Espaçamento | Tokens de 4, 8, 12, 16, 24, 32, 48 e 64 px; evitar valores espalhados pelo código. |
| Componentes | Bordas discretas, raio de 12–16 px e sombra suave; ícones da biblioteca já instalada. |
| Conteúdo | Português consistente, rótulos curtos, textos reais e chamadas para explorar egressos ou cadastrar perfil. |
| Movimento | Transições breves; respeitar preferência por movimento reduzido; controles visíveis no carrossel. |
| Identidade | Preservar a marca UFMA usada pelo projeto e distinguir o caráter demonstrativo do portal. |

Definir tokens semânticos para cores, tipografia, espaçamento, raio, sombra e foco. Desenhar primeiro estados normal, hover, foco, desabilitado, carregando e erro. Não apresentar números ou indicadores que a API não forneça.

## Organização das telas e navegação

Manter os caminhos públicos atuais. Agrupar a navegação em Início, Egressos, Depoimentos, Destaques e Sobre o portal. Destacar “Cadastrar perfil” e deixar “Área da coordenação” como acesso secundário.

| Tela / rota | Melhoria prevista | Critério de entrega |
| --- | --- | --- |
| Início `/` | Cabeçalho compacto; abertura com proposta e duas ações; destaques; exploração de cursos e egressos; depoimentos e rodapé. | Hierarquia clara, dados reais e estados sem conteúdo ou falha. |
| Egressos `/egressos/listar` | Busca principal, filtros recolhíveis no celular, contagem de resultados, cards com formação e cargo disponíveis. | Filtros previsíveis, limpar filtros, link de perfil e foto padrão local. |
| Perfis `/egresso_view/:id` e `/egresso/:id` | Resumo com foto, nome e vínculos; descrição, formação, experiência, depoimentos e destaques; componentes de leitura compartilhados. | URLs preservadas e formulários de gestão mantidos no contexto correto. |
| Cadastro e edição `/edit-egresso`, `/edit-egresso/:id` | Seções “Identificação”, “Apresentação” e “Links”; preview da foto; obrigatórios claros; salvar e cancelar. | Edição carrega valores, impede envio duplicado e preserva entradas em caso de erro. |
| Depoimentos `/egressos/depoimentos` | Cards legíveis com autor, data, relato e perfil; pesquisa por ano com ação clara. | Relatos longos não quebram o layout; filtro e limpeza funcionam. |
| Destaques `/destaques` e `/egresso/:id/destaques` | Cards editoriais e linha do tempo com datas, títulos e imagens proporcionais. | Conteúdo longo, imagem ausente e lista vazia tratados. |
| Sobre `/proposta` | Apresentação institucional com propósito, público e funcionamento. | Texto revisado e navegação consistente. |
| Login `/login` | Formulário com rótulos, mostrar senha, retorno ao portal, erro contextual e credenciais demo identificadas. | Preservar login/cadastro existentes e encaminhamento de cada tipo de coordenador. |
| Coordenação de curso `/coordenador/:id` | Layout de gestão, cursos, egressos e criação/edição de destaques em seções claras. | Operações atuais preservadas; exclusão exige confirmação. |
| Coordenação geral `/coordenador_geral/:id` | Mesmo layout de gestão; cursos e coordenadores com ações e formulários organizados. | Tabelas legíveis no celular, validação contextual e atualização após operações. |
| Rota desconhecida | Página de caminho não encontrado com retorno ao início. | Nenhuma URL inválida resulta em tela vazia. |

Wireframe conceitual da página inicial:

```text
Logo | Navegação | Cadastrar perfil | Área da coordenação
Título e proposta do portal | Imagem da comunidade
[Explorar egressos] [Cadastrar perfil]
Destaques da comunidade: cards e acesso à trajetória
Explorar cursos e egressos: busca e listagem resumida
Depoimentos: relatos com autor e acesso ao perfil
Rodapé: navegação, contexto institucional e identificação da demo
```

No celular, empilhar a abertura, recolher a navegação em menu acessível e apresentar cards em uma coluna. Nos painéis, recolher a navegação lateral e manter ações próximas dos dados correspondentes.

## Arquitetura do frontend

Migrar por tela, mantendo o sistema utilizável entre entregas. Adotar CSS Modules nos componentes reformulados; o Vite oferece suporte a arquivos `.module.css` sem uma biblioteca extra. [Documentação do Vite](https://vite.dev/guide/features.html#css-modules).

```text
frontend/src/
  App.jsx                       # Composição do roteador
  routes/                       # Definições de rotas e página não encontrada
  layouts/                      # PublicLayout, CoordenacaoLayout, LoginLayout
  components/
    ui/                         # Button, Field, Select, Card, Badge, Dialog
    feedback/                   # LoadingState, EmptyState, ErrorState, Notice
    navigation/                 # Header, MobileMenu, Footer, Breadcrumbs
    egressos/                   # EgressoCard, ProfileSections, Timeline
  pages/                        # Preservar agrupamentos de domínio existentes
  hooks/                        # Reutilização de busca e estado de requisição
  services/
    api.js                      # API_URL, cliente HTTP e normalização de erros
    egressos.js                  # Consultas e mutações de egressos
    cursos.js
    coordenadores.js
    destaques.js
    depoimentos.js
  styles/                       # Tokens, reset e estilos globais mínimos
  assets/                       # Recursos locais
```

Usar Axios, já instalado, como cliente comum. Reaproveitar `API_URL` e o proxy existente. Migrar consumidores gradualmente e manter `config/config.js` como compatibilidade enquanto necessário. Hooks devem reunir lógica compartilhada, com estados explícitos e limpeza de requisições; não criar abstrações para componentes que só existem uma vez. [Orientação do React](https://react.dev/learn/reusing-logic-with-custom-hooks).

Para filtros combinados, coordenar os endpoints separados que a API já oferece e intersectar resultados por `id_egresso`. Aplicar debounce e ignorar/cancelar respostas obsoletas. Confirmar os formatos retornados antes da implementação. A paginação inicial será local; paginação no servidor dependeria de outra etapa no backend.

Evitar CSS global em páginas. Manter dois espaços no JSX, nomes PascalCase e vocabulário de domínio existente. Remover dependências somente depois de não existirem consumidores e validar o lockfile.

## Plano de execução

| Etapa | Trabalho e entregáveis | Dependência / conclusão |
| --- | --- | --- |
| 0. Referência inicial | Rodar a demo, registrar lint/build e capturar telas atuais em desktop e celular. Inventário estático já realizado; execução ainda pendente. | Banco demo ativo e contratos conferidos; não apagar dados existentes. |
| 1. Base visual | Tokens, reset, contêiner, tipografia, Button/Field e estados compartilhados; corrigir propagação de atributos. | Aprovar no próprio código uma página de referência e verificar teclado. |
| 2. Estrutura e início | Layout público, navegação móvel, rodapé, rotas e página inicial. Corrigir duplicidade de rota e carregamento artificial. | Etapa 1; navegação completa, layout fluido e dados reais. |
| 3. Consulta e conteúdo | Listagem/filtros, perfil de leitura, depoimentos, destaques, linha do tempo e proposta. Extrair serviços e componentes necessários. | Etapa 2; busca consistente e todas as URLs antigas funcionam. |
| 4. Formulários | Cadastro/edição, foto, cargos, cursos e depoimentos; validação, estado de envio e feedback contextual. | Perfil e componentes compartilhados; testar ciclo criar–editar–consultar. |
| 5. Coordenação | Login, layout de gestão, cursos, coordenadores e destaques; confirmações e atualização de tabelas. | Etapas 1 e 4; validar contas admin.demo e coord.demo. |
| 6. Revisão e apresentação | Teclado, contraste, responsividade, revisão de textos, imagens e regressões; substituir placeholders do README por capturas reais. | Todas as telas entregues; lint/build e roteiro de demonstração aprovados. |

Registrar cada etapa em um commit coeso, por exemplo `Refina navegacao publica do portal` ou `Organiza formularios de cadastro do egresso`. Manter a branch dedicada até concluir a revisão e abrir um PR com comportamento, capturas e validações. Não publicar ou integrar automaticamente à main como parte deste planejamento.

## Acessibilidade e responsividade

Almejar os critérios aplicáveis de WCAG 2.2 AA e verificar manualmente, sem declarar conformidade antes da avaliação. Conferir contraste de texto de 4,5:1, ou 3:1 para texto grande; teclado e foco visível; rótulos e associação de erros; hierarquia de títulos; textos alternativos; leitura com zoom e conteúdo sem rolagem horizontal indevida. [Referência W3C](https://www.w3.org/WAI/WCAG22/quickref/).

Nos diálogos, gerenciar entrada e retorno de foco, Escape e navegação interna pelo teclado. [Padrão W3C para diálogo](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

Usar 44 px como meta de área confortável de toque, não como declaração de requisito mínimo AA. Testar larguras de 320, 375, 768, 1024 e 1440 px. Escolher pontos de adaptação pelo conteúdo. Tabelas podem ter rolagem própria quando necessário, sem causar rolagem horizontal da página inteira.

## Validação e regressões

Depois de instalar as dependências travadas, rodar na pasta `frontend/`:

```bash
npm ci
npm run lint
npm run build
```

Registrar a referência inicial antes de alterar o código. A meta final é nenhum erro ou aviso pendente de lint, build concluído e nenhum erro de aplicação no console. Não instalar um runner de testes apenas para mudanças cosméticas. Para a coordenação de filtros e transformações de dados, avaliar testes focados em respostas fora de ordem, interseção e reset; escolher o runner com a implementação.

Roteiro com banco demonstrativo: abrir todas as rotas, filtrar e limpar a listagem, consultar perfil e trajetória, cadastrar egresso, editar sem alterar e-mail, associar curso/cargo, registrar depoimento, entrar como coord.demo e criar/editar destaque, entrar como admin.demo e gerenciar cursos/coordenadores. Confirmar atualização das listas, erros da API, campos vazios, texto longo e foto ausente.

Verificar envio duplicado, cancelamento de ações, API indisponível, perfil inexistente e menu/diálogos por teclado. Fazer capturas desktop e celular com dados fictícios. Usar Lighthouse como diagnóstico local de acessibilidade e desempenho, comparando a referência inicial; não prometer nota antes da medição.

## Limites, riscos e dependências

- A análise estática não substitui execução no navegador. O ambiente demo e as dependências precisam ser iniciados antes das etapas visuais.
- Migração de CSS pode alterar páginas que compartilham classes; converter e validar por tela.
- Dois perfis de egresso compartilham leitura e têm ações diferentes; extrair apresentação sem remover operações existentes.
- Busca combinada precisa respeitar respostas dos endpoints atuais; não inventar campos ou novos contratos.
- O login permanece demonstrativo. Reorganizar o frontend não transforma o mecanismo atual em autenticação de produção.
- Preservar volumes do banco demo durante validação. Tratar mudanças de Java, infraestrutura e segurança da API em escopo próprio.

## Definição de conclusão do redesign

Todas as telas da matriz implementadas; identidade e componentes consistentes; rotas e operações atuais preservadas; uso por teclado e em celular verificado; filtros previsíveis; feedback de carregamento/erro/vazio; lint/build aprovados; demo Docker funcional; capturas reais no README; PR pronto para revisão com evidências.

## Implementação e validação

A identidade visual foi aplicada às telas da matriz na branch `feat/frontend-redesign`: cores, tipografia e espaçamentos; CSS Modules; cabeçalho com menu móvel; rodapé; página inicial; consulta de egressos; depoimentos; destaques e linha do tempo; perfis; cadastro/edição; acesso e painéis de coordenação. Os estilos antigos substituídos foram removidos. O backend e os contratos HTTP existentes foram preservados.

O carrossel inicial usa Swiper `12.2.0`, com navegação, paginação, barra de arraste e suporte a teclado. Ele reúne os destaques da API e três cartões de apresentação do portal, que continuam disponíveis com banco vazio ou serviço indisponível. Esses cartões descrevem funcionalidades; não simulam registros de egressos. Falhas da consulta exibem mensagem e ação para tentar novamente.

A busca de egressos combina os resultados dos filtros por ID e cancela consultas anteriores ao aplicar novos critérios. As telas públicas usam estados de carregamento, erro e vazio. Perfis compartilham a apresentação de contato, formação, atuação e depoimentos. Formulários incluem rótulos, revisão do perfil e estados de envio; exclusões pedem confirmação, e erros dessas operações aparecem também dentro do diálogo.

Validações executadas:

- ESLint sem erros ou avisos; build de produção concluído, com carregamento por rota e sem o aviso anterior de chunks acima de 500 KB.
- Quatro casos de teste com o runner nativo do Node: interseção/duplicatas, limpeza/codificação de filtros, datas e mensagens de validação. O comando `npm test` também integra o workflow de CI.
- Imports, classes de CSS Modules e pares principais de contraste conferidos.
- Renderização das 14 rotas em DOM simulado e API simulada, incluindo a rota inexistente. Verificações de estado e callbacks para menu, controles do carrossel com API vazia/indisponível, abertura/cancelamento de formulários, confirmação de exclusão, revisão/salvamento de edição e abertura do formulário de destaque.

A simulação não mede layout, gestos ou foco nativo do navegador. Permanecem pendentes a revisão visual nas larguras planejadas, teclado real e diálogo modal nativo, ciclo completo de operações com o backend/PostgreSQL demonstrativo e capturas reais das telas. Não declarar conformidade de acessibilidade nem aprovação da integração com base apenas nessas verificações.

Para revisar, executar `npm run dev` em `frontend/` com a API demonstrativa disponível. Conferir todas as rotas públicas, os perfis e formulários, e os painéis com as contas `coord.demo` e `admin.demo`. Usar o roteiro de regressões acima; registrar capturas somente da interface efetivamente renderizada no navegador. O README contém a descrição do software, os comandos atualizados e o comportamento do carrossel, sem registros do planejamento.
