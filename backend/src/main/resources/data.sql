INSERT INTO "egresso" ("nome", "email", "descricao", "foto", "linkedin", "instagram", "curriculo")
VALUES
('Carlos Eduardo', 'carlos.edu@gmail.com', 
 'Desenvolvedor Full Stack com mais de 8 anos de experiência em projetos nacionais e internacionais. Graduado em Ciência da Computação pela UFPE, Carlos já atuou em grandes startups e atualmente lidera times de desenvolvimento focados em aplicações web e mobile.',
 'https://unsplash.com/pt-br/fotografias/boys-face-close-up-photography-n4KewLKFOZw', 
 'https://linkedin.com/in/carloseduardo', 
 'https://instagram.com/carlosedu', 
 'https://drive.google.com/file/d/1aBcD12345/view?usp=sharing'),

('Ana Beatriz', 'ana.beatriz@gmail.com', 
 'Designer de UX/UI apaixonada por criar experiências digitais intuitivas. Formada pela UFRJ, Ana possui forte atuação no setor financeiro, onde contribuiu para o redesign de apps com milhões de usuários.',
 'https://unsplash.com/pt-br/fotografias/fotografia-de-foco-raso-da-mulher-ao-ar-livre-durante-o-dia-rDEOVtE7vOs', 
 'https://linkedin.com/in/anabeatriz', 
 'https://instagram.com/ana.beatriz', 
 'https://www.dropbox.com/s/abc123/Curriculo_AnaBeatriz.pdf?dl=0'),

('João Pedro', 'joao.pedro@gmail.com', 
 'Cientista de Dados formado pela USP com especialização em Machine Learning. Atuou em projetos de Big Data na área da saúde e hoje lidera equipes de IA focadas em modelos preditivos para o setor bancário.',
 'https://unsplash.com/pt-br/fotografias/retrato-do-homem-caucasiano-alegre-Bs7Ijl1h4VU', 
 'https://linkedin.com/in/joaopedro', 
 'https://instagram.com/joaopedro', 
 'https://docs.google.com/document/d/1abcXYZ12345/edit?usp=sharing'),

('Mariana Rocha', 'mariana.rocha@gmail.com', 
 'Arquiteta de Software com 12 anos de experiência na indústria de tecnologia. Graduada em Engenharia de Software pela UNICAMP, Mariana tem foco em arquitetura de microsserviços e Cloud Computing.',
 'https://unsplash.com/pt-br/fotografias/mulher-se-apoia-na-parede-de-concreto-cinza-JN0SUcTOig0', 
 'https://linkedin.com/in/marianarocha', 
 'https://instagram.com/marianarocha', 
 'https://mariana-rocha.github.io/curriculo-mariana.pdf'),

('Fernando Lima', 'fernando.lima@gmail.com', 
 'Product Owner com histórico acadêmico em Administração e MBA em Gestão de Projetos. Apaixonado por inovação, Fernando tem liderado squads ágeis em empresas do setor de tecnologia financeira.',
 'https://unsplash.com/pt-br/fotografias/homem-vestindo-jaqueta-preta-durante-o-dia-Y7C7F26fzZM', 
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
