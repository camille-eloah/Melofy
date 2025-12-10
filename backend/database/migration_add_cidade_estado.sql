-- Migração para adicionar os campos cidade e estado às tabelas de usuários
-- Execute este script se o banco de dados já existia antes da adição destes campos

USE db_melofy;

-- Adicionar coluna cidade na tabela tb_professor (se não existir)
ALTER TABLE tb_professor 
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) NULL AFTER telefone;

-- Adicionar coluna estado na tabela tb_professor (se não existir)
ALTER TABLE tb_professor 
ADD COLUMN IF NOT EXISTS estado VARCHAR(2) NULL AFTER cidade;

-- Adicionar coluna cidade na tabela tb_aluno (se não existir)
ALTER TABLE tb_aluno 
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100) NULL AFTER telefone;

-- Adicionar coluna estado na tabela tb_aluno (se não existir)
ALTER TABLE tb_aluno 
ADD COLUMN IF NOT EXISTS estado VARCHAR(2) NULL AFTER cidade;

-- Verificar se as colunas foram adicionadas
DESCRIBE tb_professor;
DESCRIBE tb_aluno;
