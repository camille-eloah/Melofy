CREATE DATABASE db_melofy;
USE db_melofy;

CREATE TABLE tb_professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    global_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    tipo_usuario ENUM('PROFESSOR','ALUNO') NOT NULL DEFAULT 'PROFESSOR',
    bio TEXT NULL,
    texto_intro TEXT NULL,
    texto_desc TEXT NULL,
    telefone VARCHAR(20) NULL,
    hashed_password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    vacation_mode BOOLEAN NOT NULL DEFAULT FALSE,
    conta_status ENUM('ATIVO', 'DESATIVADO', 'EXCLUSAO') NOT NULL DEFAULT 'ATIVO'
);

CREATE TABLE tb_aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,
    global_uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    tipo_usuario ENUM('PROFESSOR','ALUNO') NOT NULL DEFAULT 'ALUNO',
    bio TEXT NULL,
    texto_intro TEXT NULL,
    texto_desc TEXT NULL,
    telefone VARCHAR(20) NULL,
    hashed_password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) NULL,
    created_at DATETIME NOT NULL,
    conta_status ENUM('ATIVO', 'DESATIVADO', 'EXCLUSAO') NOT NULL DEFAULT 'ATIVO'
);

CREATE TABLE tb_categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO tb_categoria (nome) VALUES
    ('Cordas'),
    ('Sopro'),
    ('Percussão'),
    ('Teclas'),
    ('Voz'),
    ('Eletrônico'),
    ('Acessório'),
    ('Outros');

CREATE TABLE tb_instrumento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo INT NOT NULL,
    FOREIGN KEY (tipo) REFERENCES tb_categoria(id)
);

INSERT INTO tb_instrumento (id, nome, tipo) VALUES
    -- 🎸 CORDAS
    (2, 'Guitarra', 1),
    (3, 'Violão', 1),
    (6, 'Baixo', 1),
    (7, 'Violino', 1),
    (15, 'Ukulele', 1),
    (16, 'Harpa', 1),
    (17, 'Bandolim', 1),
    (18, 'Cavaquinho', 1),
    (19, 'Cello', 1),
    (20, 'Contrabaixo Acústico', 1),
    (21, 'Banjo', 1),
    (22, 'Rabeca', 1),
    (57, 'Sitar', 1),
    (58, 'Shamisen', 1),
    (60, 'Berimbau', 1),
    (61, 'Charango', 1),
    (62, 'Balalaica', 1),
    (63, 'Erhu', 1),
    (64, 'Koto', 1),
    (65, 'Viola Caipira', 1),
    (66, 'Lute', 1),
    (67, 'Mandola', 1),
    (68, 'Tar', 1),
    (69, 'Oud', 1),
    (70, 'Nyckelharpa', 1),
    (71, 'Gayageum', 1),
    (72, 'Guqin', 1),
    (73, 'Veena', 1),
    (74, 'Lyra', 1),
    (75, 'Dobro', 1),
    (135, 'Sarangi', 1),
    (136, 'Morin Khuur', 1),
    (137, 'Hardanger Fiddle', 1),
    (145, 'Baglama', 1),
    (146, 'Sarod', 1),
    (147, 'Kravik Lyre', 1),
    (148, 'Domra', 1),
    (149, 'Laúd Árabe', 1),
    (150, 'Cítara', 1),

    -- 🎺 SOPRO
    (1, 'Saxofone', 2),
    (4, 'Flauta', 2),
    (23, 'Clarinete', 2),
    (24, 'Oboé', 2),
    (25, 'Fagote', 2),
    (26, 'Trompete', 2),
    (27, 'Trombone', 2),
    (28, 'Trompa', 2),
    (29, 'Tuba', 2),
    (30, 'Gaita', 2),
    (31, 'Flauta Doce', 2),
    (59, 'Ocarina', 2),
    (76, 'Corneta', 2),
    (77, 'Cornetim', 2),
    (78, 'Piccolo', 2),
    (79, 'Sax Tenor', 2),
    (80, 'Sax Alto', 2),
    (81, 'Sax Barítono', 2),
    (82, 'Didgeridoo', 2),
    (83, 'Chinelo (instrumento indígena)', 2),
    (84, 'Shofar', 2),
    (85, 'Cornamusa', 2),
    (86, 'Bombardino', 2),
    (87, 'Sanfona de Boca', 2),
    (88, 'Whistle Irlandês', 2),
    (89, 'Kena', 2),
    (90, 'Flauta Transversal Contralto', 2),
    (139, 'Erke', 2),
    (140, 'Zampogna', 2),
    (141, 'Duduk', 2),
    (142, 'Hulusi', 2),
    (143, 'Bansuri', 2),
    (144, 'Flauta de Pan', 2),

    -- 🥁 PERCUSSÃO
    (32, 'Bateria', 3),
    (33, 'Caixa', 3),
    (34, 'Bumbo', 3),
    (35, 'Pratos', 3),
    (36, 'Triângulo', 3),
    (37, 'Pandeiro', 3),
    (38, 'Tímpanos', 3),
    (39, 'Xilofone', 3),
    (40, 'Marimba', 3),
    (41, 'Djembê', 3),
    (42, 'Cajón', 3),
    (43, 'Cuíca', 3),
    (44, 'Agogô', 3),
    (45, 'Reco-reco', 3),
    (46, 'Tamborim', 3),
    (91, 'Repinique', 3),
    (92, 'Surdo', 3),
    (93, 'Atabaque', 3),
    (94, 'Gong', 3),
    (95, 'Castanholas', 3),
    (96, 'Bongô', 3),
    (97, 'Congas', 3),
    (98, 'Tambor Taiko', 3),
    (99, 'Vibraslap', 3),
    (100, 'Flexatone', 3),
    (101, 'Guiro', 3),
    (102, 'Shekere', 3),
    (103, 'Kalimba', 3),
    (104, 'Metalofone', 3),
    (105, 'Udu', 3),
    (106, 'Tubular Bells', 3),
    (107, 'Claves', 3),
    (108, 'Chocalho', 3),
    (131, 'Kalangu', 3),
    (132, 'Mbira', 3),
    (133, 'Kanjira', 3),
    (134, 'Tabla', 3),
    (138, 'Gamelão', 3),

    -- 🎹 TECLAS
    (9, 'Teclado', 4),
    (10, 'Acordeão', 4),
    (11, 'Piano', 4),
    (12, 'Órgão', 4),
    (13, 'Cravo', 4),
    (109, 'Melódica', 4),
    (110, 'Clavinet', 4),
    (111, 'Harmônio', 4),

    -- 🎤 VOZ
    (8, 'Canto', 5),
    (47, 'Coral Infantil', 5),
    (48, 'Coral Adulto', 5),
    (49, 'Técnica Vocal Avançada', 5),
    (112, 'Canto Lírico', 5),
    (113, 'Canto Popular', 5),
    (114, 'Canto Coral', 5),
    (115, 'Aulas de Dicção Vocal', 5),

    -- 🎧 ELETRÔNICOS
    (14, 'Sintetizador', 6),
    (50, 'Drum Machine', 6),
    (51, 'Controlador MIDI', 6),
    (52, 'Sampler', 6),
    (116, 'Theremin', 6),
    (117, 'Piano Digital', 6),
    (118, 'Beatpad', 6),
    (119, 'Looper', 6),
    (120, 'Workstation Musical', 6),

    -- 🗂️ ACESSÓRIOS
    (5, 'Partitura', 7),
    (53, 'Estante de Partitura', 7),
    (54, 'Afinador Digital', 7),
    (55, 'Baqueta', 7),
    (56, 'Palheta de Guitarra', 7),
    (121, 'Capotraste', 7),
    (122, 'Vassourinhas', 7),
    (123, 'Surdina de Trompete', 7),
    (124, 'Surdina de Trombone', 7),
    (125, 'Almofada de Violino', 7),
    (126, 'Pedal Sustain', 7),
    (127, 'Encordoamento de Violão', 7),
    (128, 'Bocal de Trompete', 7),
    (129, 'Bocal de Saxofone', 7),
    (130, 'Espaleira de Violino', 7);

CREATE TABLE tb_professor_instrumento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_professor INT NOT NULL,
    id_instrumento INT NOT NULL,
    FOREIGN KEY (id_professor) REFERENCES tb_professor(id),
    FOREIGN KEY (id_instrumento) REFERENCES tb_instrumento(id)
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

CREATE TABLE tb_pacotes (
    pac_id INT AUTO_INCREMENT PRIMARY KEY,
    pac_prof_id INT NOT NULL,
    pac_nome VARCHAR(255) NOT NULL,
    pac_quantidade_aulas INT NOT NULL CHECK (pac_quantidade_aulas > 0),
    pac_valor_total DECIMAL(10,2) NOT NULL CHECK (pac_valor_total > 0),
    pac_valor_hora_aula DECIMAL(10,2) GENERATED ALWAYS AS (pac_valor_total / pac_quantidade_aulas) STORED,
    pac_criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pac_ativo BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_pacote_prof FOREIGN KEY (pac_prof_id) REFERENCES tb_professor(id)
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
    CONSTRAINT uk_avaliacao_aluno UNIQUE (ava_prof_avaliador, ava_alu_avaliado),

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
    CONSTRAINT uk_avaliacao_prof UNIQUE (ava_alu_avaliador, ava_prof_avaliado),

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
    id_professor INT NULL,
    aluno_id INT NULL,

    FOREIGN KEY (id_professor) REFERENCES tb_professor(id),
    FOREIGN KEY (aluno_id) REFERENCES tb_aluno(id)
);

CREATE TABLE tb_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em DATETIME NOT NULL
);

CREATE TABLE tb_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NULL,
    tipo ENUM('INSTRUMENTO','LIVRE') NOT NULL DEFAULT 'LIVRE',
    instrumento_id INT NULL,
    CONSTRAINT fk_tag_instrumento FOREIGN KEY (instrumento_id) REFERENCES tb_instrumento(id)
);


CREATE TABLE tb_professor_tag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_professor INT NOT NULL,
    tag_id INT NOT NULL,
    UNIQUE KEY uk_professor_tag (id_professor, tag_id),
    FOREIGN KEY (id_professor) REFERENCES tb_professor(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tb_tags(id) ON DELETE CASCADE
);

-- Configurações do Professor
CREATE TABLE tb_config_professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prof_id INT NOT NULL UNIQUE,
    valor_hora_aula DECIMAL(10,2) NULL,
    tipo_aula_principal ENUM('remota','presencial','domicilio') NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_config_prof FOREIGN KEY (prof_id) REFERENCES tb_professor(id) ON DELETE CASCADE
);

-- Configuração de Aula Remota (Google Meet)
CREATE TABLE tb_config_aula_remota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prof_id INT NOT NULL UNIQUE,
    link_meet VARCHAR(255) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_remota_prof FOREIGN KEY (prof_id) REFERENCES tb_professor(id) ON DELETE CASCADE
);

-- Configuração de Aula Presencial (Local)
CREATE TABLE tb_config_aula_presencial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prof_id INT NOT NULL UNIQUE,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(255) NOT NULL,
    complemento VARCHAR(255) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_presencial_prof FOREIGN KEY (prof_id) REFERENCES tb_professor(id) ON DELETE CASCADE
);

-- Configuração de Aula no Domicílio (sem dados adicionais, apenas confirmação)
CREATE TABLE tb_config_aula_domicilio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prof_id INT NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_domicilio_prof FOREIGN KEY (prof_id) REFERENCES tb_professor(id) ON DELETE CASCADE
);

-- Mensagens privadas entre professores e alunos
CREATE TABLE tb_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_uuid CHAR(36) NOT NULL,
    remetente_tipo ENUM('PROFESSOR','ALUNO') NOT NULL,
    destinatario_uuid CHAR(36) NOT NULL,
    destinatario_tipo ENUM('PROFESSOR','ALUNO') NOT NULL,
    texto TEXT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mensagens_remetente (remetente_uuid, created_at),
    INDEX idx_mensagens_destinatario (destinatario_uuid, created_at)
);
