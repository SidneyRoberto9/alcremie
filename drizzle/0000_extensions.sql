-- Passos de provisionamento do servidor real (banco de dados e role), a
-- rodar uma vez como superuser antes de qualquer coisa abaixo. Neste
-- ambiente de desenvolvimento eles já foram feitos por um container local
-- (alcremie-pg, postgres:17-alpine, porta 55432) — registrados aqui apenas
-- para não se perder o passo a passo do servidor de produção real.
--
-- CREATE DATABASE alcremie;
-- CREATE ROLE alcremie_app LOGIN PASSWORD '<senha forte>';
-- GRANT CONNECT ON DATABASE alcremie TO alcremie_app;
-- \c alcremie
-- GRANT USAGE, CREATE ON SCHEMA public TO alcremie_app;

-- Rodar antes da primeira migração gerada pelo drizzle-kit.
-- pg_trgm dá o operador gin_trgm_ops usado em tags_name_trgm_idx e a função
-- similarity() usada na ordenação do autocomplete.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- gen_random_uuid() é nativo desde o Postgres 13; pgcrypto só é necessário
-- em versões anteriores.
-- No Postgres 18 ou mais novo, trocar o default das PKs para uuidv7():
-- os ids passam a ser ordenáveis por tempo e os índices param de fragmentar.
--   ALTER TABLE images ALTER COLUMN id SET DEFAULT uuidv7();
