--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cargo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    id_egresso integer NOT NULL,
    descricao text NOT NULL,
    local text NOT NULL,
    ano_inicio integer NOT NULL,
    ano_fim integer
);


ALTER TABLE public.cargo OWNER TO postgres;

--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cargo_id_cargo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cargo_id_cargo_seq OWNER TO postgres;

--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cargo_id_cargo_seq OWNED BY public.cargo.id_cargo;


--
-- Name: coordenador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coordenador (
    id_coordenador integer NOT NULL,
    login text NOT NULL,
    senha text NOT NULL,
    tipo text DEFAULT 'egresso'::text NOT NULL
);


ALTER TABLE public.coordenador OWNER TO postgres;

--
-- Name: coordenador_id_coordenador_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coordenador_id_coordenador_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coordenador_id_coordenador_seq OWNER TO postgres;

--
-- Name: coordenador_id_coordenador_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coordenador_id_coordenador_seq OWNED BY public.coordenador.id_coordenador;


--
-- Name: curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso (
    id_curso integer NOT NULL,
    id_coordenador integer,
    nome text NOT NULL,
    nivel text NOT NULL
);


ALTER TABLE public.curso OWNER TO postgres;

--
-- Name: curso_egresso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curso_egresso (
    id_curso_egresso integer NOT NULL,
    id_egresso integer NOT NULL,
    id_curso integer NOT NULL,
    ano_inicio integer NOT NULL,
    ano_fim integer
);


ALTER TABLE public.curso_egresso OWNER TO postgres;

--
-- Name: curso_egresso_id_curso_egresso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curso_egresso_id_curso_egresso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.curso_egresso_id_curso_egresso_seq OWNER TO postgres;

--
-- Name: curso_egresso_id_curso_egresso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_egresso_id_curso_egresso_seq OWNED BY public.curso_egresso.id_curso_egresso;


--
-- Name: curso_id_curso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curso_id_curso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.curso_id_curso_seq OWNER TO postgres;

--
-- Name: curso_id_curso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curso_id_curso_seq OWNED BY public.curso.id_curso;


--
-- Name: depoimento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.depoimento (
    id_depoimento integer NOT NULL,
    id_egresso integer NOT NULL,
    texto text,
    data date
);


ALTER TABLE public.depoimento OWNER TO postgres;

--
-- Name: depoimento_id_depoimento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.depoimento_id_depoimento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.depoimento_id_depoimento_seq OWNER TO postgres;

--
-- Name: depoimento_id_depoimento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.depoimento_id_depoimento_seq OWNED BY public.depoimento.id_depoimento;


--
-- Name: egresso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.egresso (
    id_egresso integer NOT NULL,
    nome text NOT NULL,
    email text NOT NULL,
    descricao text,
    foto text,
    linkedin text,
    instagram text,
    curriculo text
);


ALTER TABLE public.egresso OWNER TO postgres;

--
-- Name: egresso_id_egresso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.egresso_id_egresso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.egresso_id_egresso_seq OWNER TO postgres;

--
-- Name: egresso_id_egresso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.egresso_id_egresso_seq OWNED BY public.egresso.id_egresso;


--
-- Name: cargo id_cargo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargo ALTER COLUMN id_cargo SET DEFAULT nextval('public.cargo_id_cargo_seq'::regclass);


--
-- Name: coordenador id_coordenador; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordenador ALTER COLUMN id_coordenador SET DEFAULT nextval('public.coordenador_id_coordenador_seq'::regclass);


--
-- Name: curso id_curso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso ALTER COLUMN id_curso SET DEFAULT nextval('public.curso_id_curso_seq'::regclass);


--
-- Name: curso_egresso id_curso_egresso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_egresso ALTER COLUMN id_curso_egresso SET DEFAULT nextval('public.curso_egresso_id_curso_egresso_seq'::regclass);


--
-- Name: depoimento id_depoimento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depoimento ALTER COLUMN id_depoimento SET DEFAULT nextval('public.depoimento_id_depoimento_seq'::regclass);


--
-- Name: egresso id_egresso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.egresso ALTER COLUMN id_egresso SET DEFAULT nextval('public.egresso_id_egresso_seq'::regclass);


--
-- Data for Name: cargo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cargo (id_cargo, id_egresso, descricao, local, ano_inicio, ano_fim) FROM stdin;
1	1	Engenheiro de Software	Empresa X	2015	2020
2	2	Analista de Sistemas	Empresa Y	2018	\N
\.


--
-- Data for Name: coordenador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coordenador (id_coordenador, login, senha, tipo) FROM stdin;
1	jorge	jorge12	coordenador
2	maria	maria34	coordenador
3	lucas	lucas56	geral
\.


--
-- Data for Name: curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso (id_curso, id_coordenador, nome, nivel) FROM stdin;
1	1	Engenharia de Software	Bacharelado
\.


--
-- Data for Name: curso_egresso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curso_egresso (id_curso_egresso, id_egresso, id_curso, ano_inicio, ano_fim) FROM stdin;
\.


--
-- Data for Name: depoimento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.depoimento (id_depoimento, id_egresso, texto, data) FROM stdin;
\.


--
-- Data for Name: egresso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.egresso (id_egresso, nome, email, descricao, foto, linkedin, instagram, curriculo) FROM stdin;
1	Lucas Abreu	lucas.abreu@gmail.com	Engenheiro de Software	foto1.jpg	https://linkedin.com/in/lucasabreu	https://instagram.com/lucasabreu	Currículo de Lucas
2	Maria Silva	maria.silva@gmail.com	Analista de Sistemas	foto2.jpg	https://linkedin.com/in/mariasilva	https://instagram.com/mariasilva	Currículo de Maria
\.


--
-- Name: cargo_id_cargo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cargo_id_cargo_seq', 2, true);


--
-- Name: coordenador_id_coordenador_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coordenador_id_coordenador_seq', 3, true);


--
-- Name: curso_egresso_id_curso_egresso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_egresso_id_curso_egresso_seq', 1, false);


--
-- Name: curso_id_curso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curso_id_curso_seq', 1, true);


--
-- Name: depoimento_id_depoimento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.depoimento_id_depoimento_seq', 1, false);


--
-- Name: egresso_id_egresso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.egresso_id_egresso_seq', 2, true);


--
-- Name: cargo cargo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);


--
-- Name: coordenador coordenador_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordenador
    ADD CONSTRAINT coordenador_login_key UNIQUE (login);


--
-- Name: coordenador coordenador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordenador
    ADD CONSTRAINT coordenador_pkey PRIMARY KEY (id_coordenador);


--
-- Name: curso_egresso curso_egresso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_egresso
    ADD CONSTRAINT curso_egresso_pkey PRIMARY KEY (id_curso_egresso);


--
-- Name: curso curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_pkey PRIMARY KEY (id_curso);


--
-- Name: depoimento depoimento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depoimento
    ADD CONSTRAINT depoimento_pkey PRIMARY KEY (id_depoimento);


--
-- Name: egresso egresso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.egresso
    ADD CONSTRAINT egresso_pkey PRIMARY KEY (id_egresso);


--
-- Name: cargo cargo_egresso_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT cargo_egresso_fk FOREIGN KEY (id_egresso) REFERENCES public.egresso(id_egresso) ON DELETE CASCADE;


--
-- Name: curso curso_coordenador_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso
    ADD CONSTRAINT curso_coordenador_fk FOREIGN KEY (id_coordenador) REFERENCES public.coordenador(id_coordenador) ON DELETE SET NULL;


--
-- Name: curso_egresso curso_egresso_curso_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_egresso
    ADD CONSTRAINT curso_egresso_curso_fk FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso) ON DELETE CASCADE;


--
-- Name: curso_egresso curso_egresso_egresso_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curso_egresso
    ADD CONSTRAINT curso_egresso_egresso_fk FOREIGN KEY (id_egresso) REFERENCES public.egresso(id_egresso) ON DELETE CASCADE;


--
-- Name: depoimento depoimento_egresso_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.depoimento
    ADD CONSTRAINT depoimento_egresso_fk FOREIGN KEY (id_egresso) REFERENCES public.egresso(id_egresso) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

