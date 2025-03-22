-- Tabela "egresso"
CREATE TABLE IF NOT EXISTS "egresso" (
  "id_egresso" serial PRIMARY KEY,
  "nome" text NOT NULL,
  "email" text NOT NULL,
  "descricao" text,
  "foto" text,
  "linkedin" text,
  "instagram" text,
  "curriculo" text
);

-- Tabela "cargo"
CREATE TABLE IF NOT EXISTS "cargo" (
  "id_cargo" serial PRIMARY KEY,
  "id_egresso" integer NOT NULL,
  "descricao" text NOT NULL,
  "local" text NOT NULL,
  "ano_inicio" integer NOT NULL,
  "ano_fim" integer,
  CONSTRAINT "cargo_egresso_fk" FOREIGN KEY ("id_egresso") REFERENCES "egresso" ("id_egresso") ON DELETE CASCADE
);

-- Tabela "coordenador"
CREATE TABLE IF NOT EXISTS "coordenador" (
  "id_coordenador" serial PRIMARY KEY,
  "login" text NOT NULL UNIQUE,
  "senha" text NOT NULL,
  "tipo" text NOT NULL DEFAULT 'egresso'
);

-- Tabela "curso"
CREATE TABLE IF NOT EXISTS "curso" (
  "id_curso" serial PRIMARY KEY,
  "id_coordenador" integer,
  "nome" text NOT NULL,
  "nivel" text NOT NULL,
  CONSTRAINT "curso_coordenador_fk" FOREIGN KEY ("id_coordenador") REFERENCES "coordenador" ("id_coordenador") ON DELETE SET NULL
);

-- Tabela "curso_egresso"
CREATE TABLE IF NOT EXISTS "curso_egresso" (
  "id_curso_egresso" serial PRIMARY KEY,
  "id_egresso" integer NOT NULL,
  "id_curso" integer NOT NULL,
  "ano_inicio" integer NOT NULL,
  "ano_fim" integer,
  CONSTRAINT "curso_egresso_egresso_fk" FOREIGN KEY ("id_egresso") REFERENCES "egresso" ("id_egresso") ON DELETE CASCADE,
  CONSTRAINT "curso_egresso_curso_fk" FOREIGN KEY ("id_curso") REFERENCES "curso" ("id_curso") ON DELETE CASCADE
);

-- Tabela "depoimento"
CREATE TABLE IF NOT EXISTS "depoimento" (
  "id_depoimento" serial PRIMARY KEY,
  "id_egresso" integer NOT NULL,
  "texto" text,
  "data" date,
  CONSTRAINT "depoimento_egresso_fk" FOREIGN KEY ("id_egresso") REFERENCES "egresso" ("id_egresso") ON DELETE CASCADE
);
