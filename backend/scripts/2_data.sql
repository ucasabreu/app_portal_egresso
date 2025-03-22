-- Inserir dados na tabela "egresso"
INSERT INTO "egresso" ("nome", "email", "descricao", "foto", "linkedin", "instagram", "curriculo")
VALUES
('Lucas Abreu', 'lucas.abreu@gmail.com', 'Engenheiro de Software', 'foto1.jpg', 'https://linkedin.com/in/lucasabreu', 'https://instagram.com/lucasabreu', 'Currículo de Lucas'),
('Maria Silva', 'maria.silva@gmail.com', 'Analista de Sistemas', 'foto2.jpg', 'https://linkedin.com/in/mariasilva', 'https://instagram.com/mariasilva', 'Currículo de Maria');

-- Inserir dados na tabela "coordenador"
INSERT INTO "coordenador" ("login", "senha", "tipo")
VALUES
('jorge', 'jorge12', 'coordenador'),
('maria', 'maria34', 'coordenador'),
('lucas', 'lucas56', 'geral');

--Inserir dados na tabeça "curso"
INSERT INTO "curso" ("id_coordenador","nome","nivel")
VALUES
(
    (SELECT "id_coordenador" FROM "coordenador" WHERE "login" = 'jorge'),
    'Engenharia de Software',
    'Bacharelado'
);

-- Inserir dados na tabela "cargo"
INSERT INTO "cargo" ("id_egresso", "descricao", "local", "ano_inicio", "ano_fim")
VALUES
(
  (SELECT "id_egresso" FROM "egresso" WHERE "email" = 'lucas.abreu@gmail.com'),
  'Engenheiro de Software',
  'Empresa X',
  2015,
  2020
),
(
  (SELECT "id_egresso" FROM "egresso" WHERE "email" = 'maria.silva@gmail.com'),
  'Analista de Sistemas',
  'Empresa Y',
  2018,
  NULL
);