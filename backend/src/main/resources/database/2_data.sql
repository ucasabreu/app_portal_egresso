-- Inserir dados na tabela "egresso"
INSERT INTO "egresso" ("nome", "email", "descricao", "foto", "linkedin", "instagram", "curriculo")
VALUES
('Lucas Abreu', 'lucas.abreu@gmail.com', 'Engenheiro de Software', 'foto1.jpg', 'https://linkedin.com/in/lucasabreu', 'https://instagram.com/lucasabreu', 'Currículo de Lucas'),
('Maria Silva', 'maria.silva@gmail.com', 'Analista de Sistemas', 'foto2.jpg', 'https://linkedin.com/in/mariasilva', 'https://instagram.com/mariasilva', 'Currículo de Maria')
ON CONFLICT DO NOTHING;

-- Inserir dados na tabela "coordenador"
INSERT INTO "coordenador" ("login", "senha", "tipo")
VALUES
('jorge', 'jorge12', 'coordenador'),
('maria', 'maria34', 'coordenador'),
('lucas', 'lucas56', 'geral')
ON CONFLICT DO NOTHING;

-- Inserir dados na tabela "curso"
INSERT INTO "curso" ("id_coordenador", "nome", "nivel")
SELECT c."id_coordenador", 'Engenharia de Software', 'Bacharelado'
FROM "coordenador" c
WHERE c."login" = 'jorge'
AND NOT EXISTS (
    SELECT 1 FROM "curso" WHERE "nome" = 'Engenharia de Software'
);

-- Inserir dados na tabela "cargo"
INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Engenheiro de Software', 'Empresa X', 2015, 2020
FROM "egresso" e
WHERE e."email" = 'lucas.abreu@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Engenheiro de Software' AND "local" = 'Empresa X'
);

INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
SELECT e."id_egresso", 'Analista de Sistemas', 'Empresa Y', 2018, NULL
FROM "egresso" e
WHERE e."email" = 'maria.silva@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM "cargo" WHERE "descricao" = 'Analista de Sistemas' AND "local" = 'Empresa Y'
);
