-- ==========================================================
-- EcoSmart Mobile - Esquema de Banco de Dados Relacional
-- ==========================================================

-- Tabela de Usuários (com controle de perfil RBAC e dados de endereço padrão)
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(64) PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('cidadao', 'coletor', 'admin')),
    telefone VARCHAR(30),
    cep VARCHAR(10),
    endereco VARCHAR(255),
    numero VARCHAR(30),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    veiculo VARCHAR(100),
    capacidade_carga VARCHAR(80),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    codigo_recuperacao VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sessões / Tokens de Autenticação
CREATE TABLE IF NOT EXISTS sessoes (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP NOT NULL
);

-- Tabela de Tipos de Resíduos
CREATE TABLE IF NOT EXISTS tipos_residuos (
    id VARCHAR(64) PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    descricao TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pontos de Coleta
CREATE TABLE IF NOT EXISTS pontos_coleta (
    id VARCHAR(64) PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cep VARCHAR(10),
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(30),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(10),
    residuos_aceitos TEXT NOT NULL,
    horario VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Dicas Educativas
CREATE TABLE IF NOT EXISTS dicas_educativas (
    id VARCHAR(64) PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Descartes de Resíduos
CREATE TABLE IF NOT EXISTS descartes (
    id VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE SET NULL,
    nome_cidadao VARCHAR(120) NOT NULL,
    tipo_residuo VARCHAR(80) NOT NULL,
    quantidade VARCHAR(80) NOT NULL,
    cep VARCHAR(10),
    endereco VARCHAR(255),
    numero VARCHAR(30),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    foto_url VARCHAR(500),
    observacao TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'visualizado', 'coletado')),
    offline_sync_pending BOOLEAN DEFAULT FALSE,
    data_cadastro VARCHAR(30) NOT NULL,
    data_coleta VARCHAR(30),
    coletor_id VARCHAR(64) REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Otimização
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cep ON usuarios(cep);
CREATE INDEX IF NOT EXISTS idx_descartes_status ON descartes(status);
CREATE INDEX IF NOT EXISTS idx_descartes_usuario ON descartes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_descartes_bairro ON descartes(bairro);