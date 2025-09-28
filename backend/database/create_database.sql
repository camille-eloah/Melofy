CREATE DATABASE db_melofy;
USE db_melofy;

CREATE TABLE tb_professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    vacation_mode BOOLEAN NOT NULL DEFAULT FALSE,
    conta_status ENUM('Ativo', 'Desativado', 'Exclusão') NOT NULL DEFAULT 'Ativo'
);

CREATE TABLE tb_aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    conta_status ENUM('Ativo', 'Desativado', 'Exclusão') NOT NULL DEFAULT 'Ativo'
);

CREATE TABLE tb_instrumento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL
);

CREATE TABLE tb_aula (
    aul_id INT AUTO_INCREMENT PRIMARY KEY,
    aul_prof_id INT NOT NULL,
    aul_alu_id INT NULL,
    aul_modalidade VARCHAR(255) NOT NULL,
    aul_valor DECIMAL(10,2) NOT NULL,
    aul_data DATETIME NOT NULL,
    aul_inst_id INT NOT NULL,
    aul_status ENUM('Disponível','Indisponível') NOT NULL DEFAULT 'Disponível',

    CONSTRAINT fk_aula_prof FOREIGN KEY (aul_prof_id) REFERENCES tb_professor(id),
    CONSTRAINT fk_aula_alu FOREIGN KEY (aul_alu_id) REFERENCES tb_aluno(id),
    CONSTRAINT fk_aula_inst FOREIGN KEY (aul_inst_id) REFERENCES tb_instrumento(id)
);

CREATE TABLE tb_solicitacao_agendamento (
    sol_id INT AUTO_INCREMENT PRIMARY KEY,
    sol_prof_id INT NOT NULL,
    sol_alu_id INT NOT NULL,
    sol_instr_id INT NOT NULL,
    sol_horario DATETIME NOT NULL,
    sol_modalidade VARCHAR(255) NOT NULL,
    sol_status ENUM('Pendente','Confirmada','Recusada','Cancelada') NOT NULL DEFAULT 'Pendente',
    sol_mensagem TEXT NULL,

    CONSTRAINT fk_sol_prof FOREIGN KEY (sol_prof_id) REFERENCES tb_professor(id),
    CONSTRAINT fk_sol_alu FOREIGN KEY (sol_alu_id) REFERENCES tb_aluno(id),
    CONSTRAINT fk_sol_inst FOREIGN KEY (sol_instr_id) REFERENCES tb_instrumento(id)
);

CREATE TABLE tb_avaliacoes_aluno (
    ava_id INT AUTO_INCREMENT PRIMARY KEY,
    ava_comentario TEXT NULL,
    ava_nota INT NOT NULL CHECK (ava_nota BETWEEN 1 AND 5),
    ava_prof_avaliador INT NOT NULL,
    ava_alu_avaliado INT NOT NULL,
    data_criacao DATETIME NOT NULL,

    CONSTRAINT fk_ava_prof FOREIGN KEY (ava_prof_avaliador) REFERENCES tb_professor(id),
    CONSTRAINT fk_ava_alu FOREIGN KEY (ava_alu_avaliado) REFERENCES tb_aluno(id)
);

CREATE TABLE tb_avaliacoes_professor (
    ava_id INT AUTO_INCREMENT PRIMARY KEY,
    ava_comentario TEXT NULL,
    ava_nota INT NOT NULL CHECK (ava_nota BETWEEN 1 AND 5),
    ava_alu_avaliador INT NOT NULL,
    ava_prof_avaliado INT NOT NULL,
    data_criacao DATETIME NOT NULL,

    CONSTRAINT fk_avaalu FOREIGN KEY (ava_alu_avaliador) REFERENCES tb_aluno(id),
    CONSTRAINT fk_avaprof FOREIGN KEY (ava_prof_avaliado) REFERENCES tb_professor(id)
);

CREATE TABLE tb_pagamento (
    pag_id INT AUTO_INCREMENT PRIMARY KEY,
    pag_aul_id INT NULL,
    pag_alu_id INT NOT NULL,
    pag_prof_id INT NOT NULL,
    pag_valor_total DECIMAL(10,2) NOT NULL,
    pag_status ENUM('pendente','confirmado','falhou','estornado') NOT NULL DEFAULT 'pendente',
    pag_criacao DATETIME NOT NULL,

    CONSTRAINT fk_pag_aul FOREIGN KEY (pag_aul_id) REFERENCES tb_aula(aul_id),
    CONSTRAINT fk_pag_alu FOREIGN KEY (pag_alu_id) REFERENCES tb_aluno(id),
    CONSTRAINT fk_pag_prof FOREIGN KEY (pag_prof_id) REFERENCES tb_professor(id)
);

CREATE TABLE tb_dados_bancarios (
    dad_id INT AUTO_INCREMENT PRIMARY KEY,
    dad_nome VARCHAR(255) NOT NULL,
    dad_agencia VARCHAR(255) NOT NULL,
    dad_conta VARCHAR(255) NOT NULL,
    dad_chave VARCHAR(255) NOT NULL UNIQUE,
    professor_id INT NULL,
    aluno_id INT NULL,
    FOREIGN KEY (professor_id) REFERENCES tb_professor(id),
    FOREIGN KEY (aluno_id) REFERENCES tb_aluno(id)
);
