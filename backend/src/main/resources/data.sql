INSERT INTO "egresso" ("nome", "email", "descricao", "foto", "linkedin", "instagram", "curriculo")
VALUES
('Carlos Eduardo', 'carlos.edu@gmail.com', 
 'Desenvolvedor Full Stack com mais de 8 anos de experiência em projetos nacionais e internacionais. Graduado em Ciência da Computação pela UFPE, Carlos já atuou em grandes startups e atualmente lidera times de desenvolvimento focados em aplicações web e mobile.',
 'https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww', 
 'https://linkedin.com/in/carloseduardo', 
 'https://instagram.com/carlosedu', 
 'https://drive.google.com/file/d/1aBcD12345/view?usp=sharing'),

('Ana Beatriz', 'ana.beatriz@gmail.com', 
 'Designer de UX/UI apaixonada por criar experiências digitais intuitivas. Formada pela UFRJ, Ana possui forte atuação no setor financeiro, onde contribuiu para o redesign de apps com milhões de usuários.',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww', 
 'https://linkedin.com/in/anabeatriz', 
 'https://instagram.com/ana.beatriz', 
 'https://www.dropbox.com/s/abc123/Curriculo_AnaBeatriz.pdf?dl=0'),

('João Pedro', 'joao.pedro@gmail.com', 
 'Cientista de Dados formado pela USP com especialização em Machine Learning. Atuou em projetos de Big Data na área da saúde e hoje lidera equipes de IA focadas em modelos preditivos para o setor bancário.',
 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXZhdGFyfGVufDB8fDB8fHww', 
 'https://linkedin.com/in/joaopedro', 
 'https://instagram.com/joaopedro', 
 'https://docs.google.com/document/d/1abcXYZ12345/edit?usp=sharing'),

('Mariana Rocha', 'mariana.rocha@gmail.com', 
 'Arquiteta de Software com 12 anos de experiência na indústria de tecnologia. Graduada em Engenharia de Software pela UNICAMP, Mariana tem foco em arquitetura de microsserviços e Cloud Computing.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D', 
 'https://linkedin.com/in/marianarocha', 
 'https://instagram.com/marianarocha', 
 'https://mariana-rocha.github.io/curriculo-mariana.pdf'),

('Fernando Lima', 'fernando.lima@gmail.com', 
 'Product Owner com histórico acadêmico em Administração e MBA em Gestão de Projetos. Apaixonado por inovação, Fernando tem liderado squads ágeis em empresas do setor de tecnologia financeira.',
 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXZhdGFyfGVufDB8fDB8fHww', 
 'https://linkedin.com/in/fernandolima', 
 'https://instagram.com/fernandolima', 
 'https://drive.google.com/file/d/1B2C3D4E5F6G7H8I/view?usp=sharing')

ON CONFLICT DO NOTHING;

INSERT INTO "coordenador" ("login", "senha", "tipo")
VALUES
('jorge.softw', 'jorge12', 'coordenador'),
('matheus.IA','mathe','coordenador'),
('maria.comp', 'maria34', 'coordenador'),
('geoger.geo','geogeo','coordenador'),
('lucas.master', 'lucas56', 'geral')
ON CONFLICT DO NOTHING;

INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Engenharia de Software', 'Especialização'
FROM "coordenador" c
WHERE c."login" = 'jorge.softw'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Engenharia de Software'
);

INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Ciência da Computação', 'Bacharelado'
FROM "coordenador" c
WHERE c."login" = 'maria.comp'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Ciência da Computação'
);

INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Ciência de Dados e Inteligência Artificial', 'Mestrado'
FROM "coordenador" c
WHERE c."login" = 'matheus.IA'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Ciência de Dados e Inteligência Artificial'
);

INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Sistemas de Informação', 'Mestrado'
FROM "coordenador" c
WHERE c."login" = 'maria.comp'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Sistemas de Informação'
);

INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Engenharia de Dados', 'Bacharelado'
FROM "coordenador" c
WHERE c."login" = 'geoger.geo'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Engenharia de Dados'
);

INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Análise e Desenvolvimento de Sistemas', 'Bacharelado'
FROM "coordenador" c
WHERE c."login" = 'jorge.softw'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Análise e Desenvolvimento de Sistemas'
);


INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Desenvolvedor Full Stack', 'Google', 2016, 2021
FROM "egresso" e
WHERE e."email" = 'carlos.edu@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Desenvolvedor Full Stack' AND "local" = 'Google'
);

INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Analista de Sistemas Pleno', 'Banco do Brasil', 2017, 2022
FROM "egresso" e
WHERE e."email" = 'ana.beatriz@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Analista de Sistemas Pleno' AND "local" = 'Banco do Brasil'
);

INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Consultor em Cloud', 'Amazon AWS', 2018, 2023
FROM "egresso" e
WHERE e."email" = 'joao.pedro@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Consultor em Cloud' AND "local" = 'Amazon AWS'
);

INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Gerente de Projetos de TI', 'Globo', 2015, 2022
FROM "egresso" e
WHERE e."email" = 'mariana.rocha@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Gerente de Projetos de TI' AND "local" = 'Globo'
);

INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Engenheiro de Dados', 'Nubank', 2019, 2024
FROM "egresso" e
WHERE e."email" = 'fernando.lima@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Engenheiro de Dados' AND "local" = 'Nubank'
);


INSERT INTO "curso_egresso" ("id_egresso", "id_curso", "ano_inicio", "ano_fim")
SELECT e."id_egresso", c."id_curso", 2010, 2014
FROM "egresso" e, "curso" c
WHERE e."email" = 'mariana.rocha@gmail.com'
  AND c."nome" = 'Engenharia de Software'
  AND NOT EXISTS (
    SELECT 1 FROM "curso_egresso" WHERE "id_egresso" = e."id_egresso" AND "id_curso" = c."id_curso"
);


INSERT INTO "curso_egresso" ("id_egresso", "id_curso", "ano_inicio", "ano_fim")
SELECT e."id_egresso", c."id_curso", 2011, 2014
FROM "egresso" e, "curso" c
WHERE e."email" = 'ana.beatriz@gmail.com'
  AND c."nome" = 'Análise e Desenvolvimento de Sistemas'
  AND NOT EXISTS (
    SELECT 1 FROM "curso_egresso" WHERE "id_egresso" = e."id_egresso" AND "id_curso" = c."id_curso"
);


INSERT INTO "curso_egresso" ("id_egresso", "id_curso", "ano_inicio", "ano_fim")
SELECT e."id_egresso", c."id_curso", 2009, 2013
FROM "egresso" e, "curso" c
WHERE e."email" = 'joao.pedro@gmail.com'
  AND c."nome" = 'Ciência da Computação'
  AND NOT EXISTS (
    SELECT 1 FROM "curso_egresso" WHERE "id_egresso" = e."id_egresso" AND "id_curso" = c."id_curso"
);


INSERT INTO "curso_egresso" ("id_egresso", "id_curso", "ano_inicio", "ano_fim")
SELECT e."id_egresso", c."id_curso", 2008, 2012
FROM "egresso" e, "curso" c
WHERE e."email" = 'carlos.edu@gmail.com'
  AND c."nome" = 'Sistemas de Informação'
  AND NOT EXISTS (
    SELECT 1 FROM "curso_egresso" WHERE "id_egresso" = e."id_egresso" AND "id_curso" = c."id_curso"
);


INSERT INTO "curso_egresso" ("id_egresso", "id_curso", "ano_inicio", "ano_fim")
SELECT e."id_egresso", c."id_curso", 2014, 2018
FROM "egresso" e, "curso" c
WHERE e."email" = 'fernando.lima@gmail.com'
  AND c."nome" = 'Engenharia de Dados'
  AND NOT EXISTS (
    SELECT 1 FROM "curso_egresso" WHERE "id_egresso" = e."id_egresso" AND "id_curso" = c."id_curso"
);


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(), 
'Durante minha jornada como Desenvolvedor Full Stack, enfrentei inúmeros desafios que me tornaram um profissional mais completo. Liderar projetos em startups e empresas globais foi essencial para meu crescimento.'
FROM "egresso" e WHERE e."email" = 'carlos.edu@gmail.com';


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(), 
'Trabalhar na criação de experiências digitais sempre foi minha paixão. Um dos maiores orgulhos da minha carreira foi liderar o redesign de um app financeiro utilizado por milhões de brasileiros.'
FROM "egresso" e WHERE e."email" = 'ana.beatriz@gmail.com';


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(), 
'A Ciência de Dados me abriu portas incríveis. Poder aplicar machine learning em projetos que impactam a saúde e o setor financeiro é gratificante e desafiador todos os dias.'
FROM "egresso" e WHERE e."email" = 'joao.pedro@gmail.com';


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(), 
'A arquitetura de software sempre me fascinou. Projetar sistemas robustos e escaláveis em Cloud Computing é mais do que trabalho, é a realização de um sonho profissional.'
FROM "egresso" e WHERE e."email" = 'mariana.rocha@gmail.com';

INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(), 
'Como Product Owner, aprendi que liderar times ágeis é mais do que entregar projetos: é criar soluções que realmente fazem diferença na vida das pessoas.'
FROM "egresso" e WHERE e."email" = 'fernando.lima@gmail.com';

INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(),
'Quando comecei minha carreira, nunca imaginei onde ela me levaria.
Desenvolver soluções que são utilizadas por milhares de pessoas é uma grande responsabilidade.
Aprendi que trabalhar em equipe e saber ouvir são habilidades tão importantes quanto programar.
Hoje, liderar times é um desafio constante, mas extremamente gratificante.
Sou grato pelas oportunidades e pela confiança dos clientes e colegas.'
FROM "egresso" e WHERE e."email" = 'carlos.edu@gmail.com';


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(),
'O design transformou minha forma de ver o mundo.
Entender as necessidades reais das pessoas foi o que me guiou como UX Designer.
Cada protótipo testado e cada feedback recebido moldaram meu crescimento.
Hoje, me orgulho de ter impactado positivamente a vida de tantos usuários.
O segredo é nunca parar de escutar e aprender com cada interação.'
FROM "egresso" e WHERE e."email" = 'ana.beatriz@gmail.com';

INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(),
'A ciência de dados é mais do que números — é sobre tomar decisões melhores.
Nos projetos que lidero, buscamos transformar dados em ações concretas e éticas.
Desenvolver modelos que impactam positivamente a saúde e o mercado é recompensador.
Mas acima de tudo, é uma área que exige empatia com quem será afetado.
Me orgulho de usar tecnologia para resolver problemas do mundo real.'
FROM "egresso" e WHERE e."email" = 'joao.pedro@gmail.com';


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(),
'Projetar arquiteturas de software é como desenhar a base de um edifício.
Tudo precisa ser pensado para escalar, evoluir e resistir ao tempo.
Já enfrentei falhas em produção que me ensinaram mais do que qualquer livro.
A maturidade técnica vem com as experiências e com os erros também.
Hoje, ensino o que aprendi e continuo aprendendo todos os dias com meu time.'
FROM "egresso" e WHERE e."email" = 'mariana.rocha@gmail.com';


INSERT INTO "depoimento" ("id_egresso", "data", "texto")
SELECT e."id_egresso", NOW(),
'Como Product Owner, aprendi que a comunicação é a chave de tudo.
Conduzir uma equipe exige escuta ativa, empatia e visão clara de propósito.
Acredito que a inovação surge da colaboração e não de soluções solitárias.
Liderar um projeto é mais do que entregar — é gerar impacto real.
E isso só é possível quando o time acredita no que está construindo.'
FROM "egresso" e WHERE e."email" = 'fernando.lima@gmail.com';


INSERT INTO "destaque_egresso" ("id_egresso", "id_coordenador", "titulo", "noticia", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 
  'Reconhecimento Internacional',
  'Carlos Eduardo recebeu o prêmio de Inovação Tecnológica da América Latina, destacando-se como líder de engenharia em soluções sustentáveis.
  Ele coordenou a criação de um sistema web com mais de 10 milhões de usuários ativos.
  A premiação ocorreu em Nova York, com presença de líderes de empresas globais.
  Carlos também participou de um painel sobre o futuro da web 4.0.
  Sua trajetória serve de inspiração para jovens desenvolvedores no Brasil.',
  'https://inoxline.siglacomunicacao.com.br/wp-content/uploads/2024/07/trofeus-tecnologia-e-inovacao-14-1.jpg',
  'Prêmio de Inovação Tecnológica'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'carlos.edu@gmail.com'
  AND c."login" = 'jorge.softw'
  AND NOT EXISTS (
    SELECT 1 FROM "destaque_egresso" d
    WHERE d."titulo" = 'Reconhecimento Internacional' AND d."id_egresso" = e."id_egresso"
);


INSERT INTO "destaque_egresso" ("id_egresso", "id_coordenador", "titulo", "noticia", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 
  'UX em Grandes Bancos',
  'Ana Beatriz liderou a reformulação da experiência digital de um dos maiores bancos do país.
  Seu trabalho melhorou a taxa de conversão em 35% e foi premiado internacionalmente.
  Ela palestrou no evento UX Global Summit em Londres.
  Ana ainda foi convidada a integrar o conselho de design de uma fintech em expansão.
  Sua visão de empatia digital transformou a interação de milhões de usuários.',
  'https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBwJTIwY2VydGlmaWNhZG98ZW58MHx8MHx8fDA%3D',
  'Premiada por redesign de app bancário'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'ana.beatriz@gmail.com'
  AND c."login" = 'maria.comp'
  AND NOT EXISTS (
    SELECT 1 FROM "destaque_egresso" d
    WHERE d."titulo" = 'UX em Grandes Bancos' AND d."id_egresso" = e."id_egresso"
);


INSERT INTO "destaque_egresso" ("id_egresso", "id_coordenador", "titulo", "noticia", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 
  'Machine Learning na Saúde',
  'João Pedro implementou um sistema preditivo que antecipa diagnósticos com alta precisão.
  Seu projeto foi adotado por hospitais em três estados brasileiros.
  O trabalho colaborou com a redução de até 20% em internações desnecessárias.
  João também foi premiado como jovem pesquisador destaque de 2024.
  Atualmente lidera um time multidisciplinar com foco em IA aplicada à saúde pública.',
  'https://via.placeholder.com/300x200',
  'Sistema de IA para diagnósticos médicos'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'joao.pedro@gmail.com'
  AND c."login" = 'matheus.IA'
  AND NOT EXISTS (
    SELECT 1 FROM "destaque_egresso" d
    WHERE d."titulo" = 'Machine Learning na Saúde' AND d."id_egresso" = e."id_egresso"
);


INSERT INTO "destaque_egresso" ("id_egresso", "id_coordenador", "titulo", "noticia", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 
  'Arquitetura em Nuvem para 1 Milhão de Usuários',
  'Mariana desenhou a arquitetura de microsserviços de uma plataforma educacional nacional.
  A plataforma suporta mais de 1 milhão de acessos simultâneos.
  Seu trabalho foi elogiado por especialistas da AWS durante evento técnico.
  Mariana também publicou um artigo em revista internacional sobre escalabilidade em nuvem.
  Sua atuação como mentora inspira outras engenheiras a seguirem na área de software.',
  'https://via.placeholder.com/300x200',
  'Projeto escalável premiado em Cloud'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'mariana.rocha@gmail.com'
  AND c."login" = 'maria.comp'
  AND NOT EXISTS (
    SELECT 1 FROM "destaque_egresso" d
    WHERE d."titulo" = 'Arquitetura em Nuvem para 1 Milhão de Usuários' AND d."id_egresso" = e."id_egresso"
);


INSERT INTO "destaque_egresso" ("id_egresso", "id_coordenador", "titulo", "noticia", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 
  'Liderança Ágil em Escala',
  'Fernando liderou a transformação ágil de uma empresa fintech com 30 squads simultâneos.
  Ele implementou um modelo de governança que reduziu o time-to-market em 40%.
  Foi keynote no Agile Brazil 2024, compartilhando sua experiência com mais de 2 mil pessoas.
  Seu modelo foi replicado por startups de tecnologia e saúde.
  Atualmente, Fernando atua como consultor de transformação digital em nível internacional.',
  'https://via.placeholder.com/300x200',
  'Referência nacional em agilidade corporativa'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'fernando.lima@gmail.com'
  AND c."login" = 'geoger.geo'
  AND NOT EXISTS (
    SELECT 1 FROM "destaque_egresso" d
    WHERE d."titulo" = 'Liderança Ágil em Escala' AND d."id_egresso" = e."id_egresso"
);


INSERT INTO "destaque_egresso" ("id_egresso"," id_coordenador", "titulo", "noticia"," data_publicacao", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 'Liderança em Startups',
'Carlos Eduardo liderou times de desenvolvimento em startups inovadoras no Brasil e no exterior.
Com sua experiência em aplicações web e mobile, transformou ideias em produtos de alto impacto.
Foi responsável pela entrega de plataformas escaláveis em ambientes de alta demanda.
Seu perfil colaborativo e técnico o levou a coordenar squads multidisciplinares.
É referência em tecnologias modernas e práticas ágeis.',
NOW(), 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVuZ2VuaGFyaWElMjBkZSUyMHNvZnR3YXJlfGVufDB8fDB8fHww', 
'Liderança em ambientes ágeis'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'carlos.edu@gmail.com' AND c."login" = 'jorge.softw'
ON CONFLICT DO NOTHING;


INSERT INTO "destaque_egresso" ("id_egresso"," id_coordenador", "titulo", "noticia"," data_publicacao", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 'Design premiado',
'Ana Beatriz redesenhou a experiência de usuário de um dos principais apps financeiros do Brasil.
Com foco em acessibilidade e usabilidade, suas soluções foram adotadas por milhões de usuários.
Ela liderou um time de design e conduziu pesquisas com usuários em diferentes estados.
O projeto foi premiado nacionalmente por inovação e impacto social.
Ana acredita que o design deve ser inclusivo, eficiente e centrado no usuário.',
NOW(), 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VVglMjBkZXNpZ258ZW58MHx8MHx8fDA%3D',
'Premiada em UX Design'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'ana.beatriz@gmail.com' AND c."login" = 'maria.comp'
ON CONFLICT DO NOTHING;


INSERT INTO "destaque_egresso" ("id_egresso"," id_coordenador", "titulo", "noticia"," data_publicacao", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 'Liderança em IA',
'João Pedro aplicou modelos de inteligência artificial em projetos de saúde pública e setor bancário.
Ele lidera times de cientistas de dados em tarefas complexas envolvendo predição e Big Data.
Formado pela USP, trouxe visão analítica para problemas sociais relevantes.
Atua com ética de dados e práticas responsáveis em machine learning.
Hoje, contribui ativamente com pesquisas sobre IA e inclusão digital.',
NOW(), 'https://plus.unsplash.com/premium_photo-1682124651258-410b25fa9dc0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TWFjaGluZSUyMExlYXJuaW5nfGVufDB8fDB8fHww',
'Especialista em Machine Learning'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'joao.pedro@gmail.com' AND c."login" = 'matheus.IA'
ON CONFLICT DO NOTHING;

-- Mariana Rocha
INSERT INTO "destaque_egresso" ("id_egresso"," id_coordenador", "titulo", "noticia"," data_publicacao", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 'Referência em Arquitetura',
'Mariana Rocha projetou arquiteturas de microsserviços para grandes empresas nacionais.
Com mais de 12 anos de experiência, é referência em soluções escaláveis na nuvem.
Trabalha com ambientes multicloud e integrações complexas em tempo real.
Lidera decisões técnicas em ambientes distribuídos com times globais.
Também atua como mentora de jovens desenvolvedores em programas sociais.',
NOW(), 'https://plus.unsplash.com/premium_photo-1681487942927-e1a2786e6036?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Q2xvdWQlMjBDb21wdXRpbmd8ZW58MHx8MHx8fDA%3D',
'Especialista em Cloud Computing'
FROM "egresso" e, "coordenador" c
WHERE e."email"= 'mariana.rocha@gmail.com' AND c."login" = 'geoger.geo'
ON CONFLICT DO NOTHING;

-- Fernando Lima
INSERT INTO "destaque_egresso" ("id_egresso"," id_coordenador", "titulo", "noticia"," data_publicacao", "imagem", "feito_destaque")
SELECT e."id_egresso", c."id_coordenador", 'Liderança Ágil',
'Fernando Lima tem experiência sólida como Product Owner em fintechs e startups.
Implementou práticas ágeis com foco em entrega contínua e valor ao usuário.
Conduziu equipes interdisciplinares em ciclos rápidos de desenvolvimento.
É especialista em gestão de backlog, métricas ágeis e priorização de entregas.
Atualmente lidera squads focados em inovação para inclusão financeira.',
NOW(), 'https://plus.unsplash.com/premium_photo-1661945966032-e8b85e3ca016?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2NydW18ZW58MHx8MHx8fDA%3D',
'Gestor de Projetos de Alto Impacto'
FROM "egresso" e, "coordenador" c
WHERE e."email" = 'fernando.lima@gmail.com' AND c."login" = 'jorge.softw'
ON CONFLICT DO NOTHING;
