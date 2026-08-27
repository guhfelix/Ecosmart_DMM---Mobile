# 🗄️ Camada de Banco de Dados - EcoSmart Mobile

Esta camada organiza a modelagem relacional, esquemas de dados, cargas iniciais (*seeds*) e repositórios de acesso a dados com suporte a persistência híbrida (AsyncStorage local + Cloud Firestore em tempo real).

## 📂 Estrutura

- `schemas/schema.sql`: Definição DDL em SQL relacional (PostgreSQL/SQLite) com campos completos de perfil (`cep`, `endereco`, `numero`, `bairro`, `cidade`, `telefone`, `bio`) e descartes.
- `schemas/types.ts`: Tipagens TypeScript das entidades de banco de dados (`DbUser`, `DbDiscard`, `DbWasteType`, `DbCollectionPoint`, `DbEducationalTip`).
- `seeds/initialData.ts`: Cargas iniciais de dados de Cáceres - MT (usuários padrão, descartes, pontos de coleta e dicas).
- `repositories/`: Repositórios para isolar as consultas e mutações de dados da interface de usuário (`UserRepository`, `DiscardRepository`).

## 🗂️ Tabelas Principais

1. **`usuarios`**: Perfis `cidadao`, `coletor` e `admin` com isolamento RBAC, dados de contato e endereço padrão (`cep`, `endereco`, `numero`, `bairro`, `cidade`).
2. **`sessoes`**: Tokens e sessões com persistência automática.
3. **`descartes`**: Solicitações de descarte com `cep`, `endereco`, `numero`, `bairro`, `status` (`pendente`, `visualizado`, `coletado`) e suporte a flags de sincronização offline.
4. **`tipos_residuos`**: Materiais aceitos (Plástico, Papel, Vidro, Metal, Eletrônicos, Óleo).
5. **`pontos_coleta`**: Locais físicos com CEP, endereços, horários e resíduos aceitos em Cáceres - MT.
6. **`dicas_educativas`**: Conteúdos educativos e de conscientização ambiental sobre o Pantanal.