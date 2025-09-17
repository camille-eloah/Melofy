CREATE TABLE `UserBase` (
  `user_name        ` str,
  `user_email` str,
  `user_dados_banc_id` int,
  KEY `UNIQUE` (`user_name        `, `user_email`),
  KEY `NOT NULL` (`user_name        `, `user_email`),
  KEY `FK → Pagamentos(id)` (`user_dados_banc_id`)
);

CREATE TABLE `Dados_Bancarios` (
  `dad_id` int,
  `dad_nome` string,
  `dad_agencia` int,
  `dad_conta` string,
  `dad_chave` int,
  PRIMARY KEY (`dad_id`),
  FOREIGN KEY (`dad_agencia`)
      REFERENCES `UserBase`(`user_name        `),
  KEY `AUTOINCREMENT` (`dad_id`),
  KEY `NOT NULL` (`dad_nome`, `dad_agencia`, `dad_conta`, `dad_chave`)
);

CREATE TABLE `Conversa` (
  `id` int,
  `conv_nome` string,
  `conv_tipo` string,
  `conv_data_criacao` datetime,
  PRIMARY KEY (`id`),
  KEY `AUTOINCREMENT` (`id`),
  KEY `NOT NULL` (`conv_nome`, `conv_tipo`, `conv_data_criacao`),
  KEY `default (nome dos usuários)` (`conv_nome`),
  KEY `"privada" ou "grupo"` (`conv_tipo`),
  KEY `default CURRENT_TIMESTAMP` (`conv_data_criacao`)
);

CREATE TABLE `Pacote` (
  `pac_id` int,
  `pac_valor` float,
  `pac_descricao` string,
  `pac_titulo` string,
  `pac_model` string,
  `pac_taxa` float,
  PRIMARY KEY (`pac_id`),
  KEY `AUTOINCREMENT` (`pac_id`),
  KEY `NOT NULL` (`pac_valor`, `pac_descricao`, `pac_titulo`, `pac_model`, `pac_taxa`)
);

CREATE TABLE `Aula` (
  `aul_id ` int,
  `aul_prof_id` int,
  `aul_alu_id` foring,
  `aul_modalidade` string ("presencial", "virtual"),
  `aul_valor` string,
  `aul_data` datatime,
  `aul_inst_id` Tipo,
  `aul_status` string ("disponível", "indisponível"),
  PRIMARY KEY (`aul_id `),
  KEY `AUTOINCREMENT` (`aul_id `),
  KEY `FK → Professor(prof_id)` (`aul_prof_id`),
  KEY `FK → Aluno(alu_id)` (`aul_alu_id`),
  KEY `NOT NULL` (`aul_modalidade`, `aul_valor`, `aul_data`, `aul_inst_id`, `aul_status`)
);

CREATE TABLE `Mensagem` (
  `id` int,
  `msg_remetente_id` int,
  `msg_destinatario_id` int,
  `msg_conteudo` string,
  `msg_data_envio` datetime,
  `msg_lida` boolean,
  PRIMARY KEY (`id`),
  KEY `AUTOINCREMENT` (`id`),
  KEY `FK → (aluno.id ou professor.id)` (`msg_remetente_id`, `msg_destinatario_id`),
  KEY `NOT NULL` (`msg_conteudo`, `msg_data_envio`, `msg_lida`),
  KEY `default CURRENT_TIMESTAMP` (`msg_data_envio`),
  KEY `default False` (`msg_lida`)
);

CREATE TABLE `Solicitacao_agendamento` (
  `sol_id ` int,
  `sol_prof_id` int,
  `sol_alu_id` int,
  `sol_instr_id` int,
  `sol_horario` datetime,
  `sol_modalidade` string,
  `sol_status` string,
  `sol_mensagem` string,
  PRIMARY KEY (`sol_id `),
  KEY `FK → Professor(prof_id)` (`sol_prof_id`),
  KEY `FK → Aluho(alu_id)` (`sol_alu_id`),
  KEY `FK → Instrumento(instr_id)` (`sol_instr_id`),
  KEY `NOT NULL` (`sol_horario`, `sol_modalidade`, `sol_status`, `sol_mensagem`)
);

CREATE TABLE `Professor` (
  `prof_id ` int,
  `prof_hashed_password` string,
  `prof_created_at` datetime,
  `prof_vacation_mode` bool,
  `prof_raio-distancia` float,
  `prof_bio` string,
  PRIMARY KEY (`prof_id `),
  FOREIGN KEY (`prof_created_at`)
      REFERENCES `Solicitacao_agendamento`(`sol_instr_id`),
  KEY `UNIQUE` (`prof_hashed_password`, `prof_created_at`),
  KEY `NOT NULL` (`prof_created_at`, `prof_vacation_mode`),
  KEY `default CURRENT_TIMESTAMP` (`prof_created_at`),
  KEY `default False` (`prof_vacation_mode`),
  KEY `NULL` (`prof_raio-distancia`, `prof_bio`)
);

CREATE TABLE `Avaliacoes_do_Aluno` (
  `ava_id` int,
  `ava_comentario` string,
  `ava_nota` int,
  `ava_prof_avaliador` string,
  `ava_alu_avaliado` string,
  PRIMARY KEY (`ava_id`),
  KEY `AUTOINCREMENT` (`ava_id`),
  KEY `UNIQUE` (`ava_comentario`),
  KEY `NOT NULL` (`ava_comentario`, `ava_nota`),
  KEY `default CURRENT_TIMESTAMP` (`ava_nota`),
  KEY `FK → Professor(prof_id)` (`ava_prof_avaliador`),
  KEY `FK → Aluno(alu_id)` (`ava_alu_avaliado`)
);

CREATE TABLE `Avaliacoes_do_Professor` (
  `ava_id` int,
  `ava_comentario` string,
  `ava_nota` int,
  `ava_alu_avaliador` string,
  `ava_prof_avaliado` string,
  PRIMARY KEY (`ava_id`),
  KEY `AUTOINCREMENT` (`ava_id`),
  KEY `UNIQUE` (`ava_comentario`),
  KEY `NOT NULL` (`ava_comentario`, `ava_nota`),
  KEY `default CURRENT_TIMESTAMP` (`ava_nota`),
  KEY `FK → Aluno(prof_id)` (`ava_alu_avaliador`),
  KEY `FK → Professor(alu_id)` (`ava_prof_avaliado`)
);

CREATE TABLE `Aluno` (
  `alu_id` int,
  `alu_senha` Varchar,
  `alu_create` datetime,
  `alu_bio` string,
  PRIMARY KEY (`alu_id`),
  KEY `AUTOINCREMENT` (`alu_id`),
  KEY `UNIQUE` (`alu_senha`),
  KEY `NOT NULL` (`alu_senha`, `alu_create`, `alu_bio`),
  KEY `default CURRENT_TIMESTAMP` (`alu_create`),
  KEY `default False` (`alu_bio`)
);

CREATE TABLE `Pagamento` (
  `pag_id` int,
  `pag_aul_id` int,
  `pag_alu_id` int,
  `pag_prof_id` int,
  `pag_valor_total` float,
  `pag_status` string ("pendente", "confirmado", "falhou", "estornado"),
  `pag_tipo` string ("avulsa", "pacote"),
  `pag_criacao` datetime,
  PRIMARY KEY (`pag_id`),
  KEY `AUTOINCREMENT` (`pag_id`),
  KEY `FK → aula.id (NULL se for pacote)` (`pag_aul_id`),
  KEY `FK → Aluno(alu_id)` (`pag_alu_id`),
  KEY `FK → Professor(prof_id)` (`pag_prof_id`),
  KEY `NOT NULL` (`pag_valor_total`, `pag_status`, `pag_tipo`, `pag_criacao`),
  KEY `default CURRENT_TIMESTAMP` (`pag_criacao`)
);

CREATE TABLE `Instrumento` (
  `inst_id` int,
  `inst_nome` string,
  `inst_tipo` string,
  PRIMARY KEY (`inst_id`),
  FOREIGN KEY (`inst_id`)
      REFERENCES `Aula`(`aul_status`),
  KEY `AUTOINCREMENT` (`inst_id`),
  KEY `UNIQUE` (`inst_nome`),
  KEY `NOT NULL` (`inst_nome`, `inst_tipo`)
);

