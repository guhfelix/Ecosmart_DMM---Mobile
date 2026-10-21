# Especificação de Dados e Contratos de API - EcoSmart Mobile

## 1. Mapeamento de Modelos de Domínio

Os modelos de domínio estão centralizados em `shared/models/index.ts` e espelhados em `database/schemas/types.ts` e `database/schemas/schema.sql`.

### 1.1. Perfil e Controle de Acesso (RBAC)
```typescript
export type PerfilUsuario = 'cidadao' | 'coletor' | 'admin';
```

### 1.2. Entidade: Usuário (`Usuario`)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Sim | Identificador único (`user-cidadao-1`, UUID ou Firebase UID). |
| `nome` | `string` | Sim | Nome completo do usuário. |
| `email` | `string` | Sim | Endereço de e-mail (chave primária lógica). |
| `perfil` | `PerfilUsuario` | Sim | Papel no sistema (`cidadao`, `coletor` ou `admin`). |
| `telefone` | `string` | Não | Contato telefônico / WhatsApp formatado. |
| `cep` | `string` | Não | Código postal do endereço base (`00000-000`). |
| `endereco` | `string` | Não | Logradouro e número. |
| `bairro` | `string` | Não | Bairro de residência ou base de operação. |
| `cidade` | `string` | Não | Município (`Cáceres - MT`). |
| `veiculo` | `string` | Não | *(Coletor)* Tipo de veículo utilizado para coleta. |
| `capacidadeCarga`| `string` | Não | *(Coletor)* Capacidade de carga em kg ou volumes. |
| `cargo` | `string` | Não | *(Admin)* Cargo oficial na administração pública/SEMATUR. |
| `departamento` | `string` | Não | *(Admin)* Departamento ou secretaria gestora. |
| `bio` | `string` | Não | Descrição de compromisso ambiental ou operacional. |
| `avatarUri` | `string` | Não | URL da foto de perfil. |
| `updatedAt` | `string` | Não | Timestamp ISO da última alteração. |

### 1.3. Entidade: Descarte (`Descarte` / `CollectorDiscard` / `DiscardItem`)
| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Sim | Identificador canônico do descarte (`disc-...` ou UUID). |
| `userId` / `citizenId` | `string` | Sim | Identificador do cidadão proprietário do registro. |
| `citizenName` | `string` | Sim | Nome completo do cidadão para exibição ao catador. |
| `citizenEmail` | `string` | Não | E-mail do cidadão para rastreio e filtros. |
| `wasteType` | `string` | Sim | Categoria do material (`Plástico e PET`, `Vidro`, etc.). |
| `quantity` | `number \| string` | Sim | Quantidade numérica positiva (> 0) ou string formatada compatível com registros legados. |
| `unit` | `DiscardUnit` | Não | Unidade de medida (`'kg'`, `'unidade'`, `'saco'`, `'litro'`). |
| `cep` | `string` | Sim | CEP da localização do descarte. |
| `address` | `string` | Sim | Rua ou logradouro onde o resíduo está disponível. |
| `number` | `string` | Não | Número da residência ou ponto de referência. |
| `neighborhood` | `string` | Sim | Bairro de Cáceres - MT. |
| `city` | `string` | Sim | Cidade (`Cáceres`). |
| `observation` | `string` | Não | Instruções para o catador (ex.: "no portão da frente"). |
| `status` | `string` | Sim | Status operacional: `'pendente'` ou `'coletado'`. |
| `createdAt` | `string` | Sim | Data e hora do cadastro formatada. |
| `collectedAt` | `string` | Não | Data da confirmação de baixa da coleta. |
| `coletorId` | `string` | Não | Identificador do coletor que realizou o recolhimento. |
| `latitude` | `number` | Sim | Latitude georreferenciada. |
| `longitude` | `number` | Sim | Longitude georreferenciada. |
| `distanceKm` | `number` | Não | Distância calculada em tempo de execução via Haversine. |
| `photoUri` | `string` | Não | URL da foto do material no Cloud Storage. |
| `offline` | `boolean` | Não | Flag indicador de pendência de sincronização local. |

---

## 2. Esquemas do Cloud Firestore

### 2.1. Coleção: `usuarios`
* **Caminho:** `/databases/(default)/documents/usuarios/{userId}`
* **Regras de Segurança:** Leitura e gravação permitidas apenas se `request.auth.uid == userId`.
* **Estrutura do Documento:**
```json
{
  "id": "user-cidadao-1",
  "nome": "Maria Cidadã Pantaneira",
  "email": "maria@gmail.com",
  "perfil": "cidadao",
  "telefone": "(65) 99988-1234",
  "cep": "78200-050",
  "endereco": "Rua Cel. Faria",
  "numero": "210",
  "bairro": "Centro",
  "cidade": "Cáceres - MT",
  "bio": "Compromissada com a preservação do Pantanal.",
  "createdAt": "2026-09-21T10:00:00.000Z",
  "updatedAt": "2026-09-21T10:00:00.000Z"
}
```

### 2.2. Coleção: `descartes`
* **Caminho:** `/databases/(default)/documents/descartes/{discardId}`
* **Índices Compostos Necessários (`firestore.indexes.json`):**
  * `citizenEmail` (ASC) + `updatedAt` (DESC)
  * `userId` (ASC) + `createdAt` (DESC)
  * `status` (ASC) + `updatedAt` (DESC)
* **Estrutura do Documento:**
```json
{
  "id": "disc-1774300000",
  "userId": "user-cidadao-1",
  "citizenId": "user-cidadao-1",
  "citizenName": "Maria Cidadã Pantaneira",
  "citizenEmail": "maria@gmail.com",
  "wasteType": "Plástico e PET",
  "quantity": "2 sacolas",
  "address": "Rua Cel. Faria",
  "number": "210",
  "neighborhood": "Centro",
  "city": "Cáceres",
  "cep": "78200-050",
  "observation": "Separado e seco na calçada.",
  "status": "pendente",
  "createdAt": "21/09/2026 14:30",
  "collectedAt": null,
  "coletorId": null,
  "latitude": -16.0725,
  "longitude": -57.6798,
  "distanceKm": 0.8,
  "photoUri": null,
  "updatedAt": "2026-09-21T14:30:00.000Z"
}
```

### 2.3. Coleções Públicas de Catálogo Municipal
* `tipos_residuos/{typeId}`: `{ id, name, description }`
* `pontos_coleta/{pointId}`: `{ id, name, address, neighborhood, city, state, cep, acceptedWaste, schedule, latitude, longitude, distanceKm }`
* `dicas_educativas/{tipId}`: `{ id, title, category, content }`
* `notificacoes/{notificationId}`: `{ id, title, message, date, read, type, userId }`

### 2.4. Coleção Raiz Exclusiva de Administradores: `admins`
* **Caminho:** `/databases/(default)/documents/admins/{adminId}`
* **Regras de Segurança:** Leitura e gravação permitidas exclusivamente se `isAdmin()` for verdadeiro (`allow read, write: if isAdmin();`). 100% inacessível para usuários com perfis comuns de cidadão ou coletor.
* **Estrutura do Documento:**
```json
{
  "id": "user-admin-1",
  "nome": "João Gestor SEMATUR",
  "name": "João Gestor SEMATUR",
  "email": "joao@gmail.com",
  "perfil": "admin",
  "telefone": "(65) 3223-5500",
  "cep": "78200-000",
  "endereco": "Rua Cel. José Dulce",
  "numero": "500",
  "bairro": "Centro",
  "cidade": "Cáceres - MT",
  "cargo": "Secretário Municipal de Meio Ambiente",
  "departamento": "SEMATUR - Cáceres MT",
  "bio": "Gestão e monitoramento ambiental do município de Cáceres - MT.",
  "updatedAt": "2026-10-14T19:00:00.000Z"
}
```

### 2.5. Coleção Raiz de Auditoria Administrativa: `admin_logs`
* **Caminho:** `/databases/(default)/documents/admin_logs/{logId}`
* **Regras de Segurança:** Acesso estrito a administradores autenticados (`allow read, write: if isAdmin();`).
* **Estrutura do Documento:**
```json
{
  "id": "log-1774300000",
  "adminId": "user-admin-1",
  "action": "UPDATE_WASTE_TYPE",
  "details": { "wasteTypeId": "waste-1", "name": "Plásticos e PETs Recicláveis" },
  "timestamp": "2026-10-14T19:05:00.000Z"
}
```

---

## 3. Contratos dos Endpoints REST do Backend

Servidor central executando por padrão em `http://localhost:3333` (`scripts/sync-server.js` e `backend/src/server.ts`).

### 3.1. Health Check
* **Método:** `GET`
* **Rota:** `/api/health`
* **Descrição:** Valida disponibilidade do servidor e contagem de itens em cache local.
* **Resposta de Sucesso (200 OK):**
```json
{
  "status": "ok",
  "time": "2026-09-21T14:30:00.000Z",
  "discardsCount": 14
}
```

---

### 3.2. Listar Descartes
* **Método:** `GET`
* **Rota:** `/api/discards`
* **Query Parameters Opcionais:**
  * `userId`: Filtra os descartes de um usuário específico por ID.
  * `email`: Filtra os descartes pelo e-mail do cidadão.
  * `type`: Filtra pelo tipo de resíduo.
* **Resposta de Sucesso (200 OK):**
```json
[
  {
    "id": "disc-1774300000",
    "userId": "user-cidadao-1",
    "citizenName": "Maria Cidadã Pantaneira",
    "wasteType": "Plástico e PET",
    "quantity": "2 sacolas",
    "neighborhood": "Centro",
    "status": "pendente",
    "createdAt": "21/09/2026 14:30",
    "latitude": -16.0725,
    "longitude": -57.6798
  }
]
```

---

### 3.3. Cadastrar ou Atualizar Descarte
* **Método:** `POST`
* **Rota:** `/api/discards`
* **Request Body (JSON):**
```json
{
  "userId": "user-cidadao-1",
  "citizenName": "Maria Cidadã Pantaneira",
  "citizenEmail": "maria@gmail.com",
  "wasteType": "Papel e Papelão",
  "quantity": "1 caixa grande",
  "cep": "78200-000",
  "address": "Rua Cel. José Dulce",
  "number": "500",
  "neighborhood": "Centro",
  "observation": "Caixas de papelão desmontadas.",
  "latitude": -16.0725,
  "longitude": -57.6798
}
```
* **Resposta de Sucesso (201 Created):**
```json
{
  "success": true,
  "item": {
    "id": "disc-1774300999",
    "status": "pendente",
    "createdAt": "21/09/2026",
    "updatedAt": "2026-09-21T14:35:00.000Z"
  }
}
```

---

### 3.3.1. Editar Descarte Existente por ID
* **Método:** `PUT` ou `PATCH`
* **Rota:** `/api/discards/:id`
* **Headers Obrigatórios:** `Authorization: Bearer <token>`, `X-User-Id`, `X-User-Role`
* **Descrição:** Atualiza um descarte existente preservando o mesmo `id` original, validando se o requisitante é o proprietário do descarte (`userId`) ou administrador (`admin`) e se a quantidade é numérica positiva (> 0).
* **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "item": {
    "id": "disc-1774300999",
    "quantity": 5,
    "unit": "kg",
    "status": "pendente",
    "updatedAt": "2026-09-21T14:38:00.000Z"
  }
}
```

---

### 3.4. Confirmar Coleta (Baixa em 1 Toque)
* **Método:** `POST` ou `PATCH`
* **Rota:** `/api/discards/:id/collect`
* **URL Params:** `id` (ID do descarte a ser coletado).
* **Request Body (JSON):**
```json
{
  "coletorId": "user-coletor-1"
}
```
* **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "item": {
    "id": "disc-1774300999",
    "status": "coletado",
    "coletorId": "user-coletor-1",
    "collectedAt": "21/09/2026",
    "updatedAt": "2026-09-21T14:40:00.000Z"
  }
}
```
* **Resposta de Erro (404 Not Found):**
```json
{
  "error": "Descarte não encontrado"
}
```

---

### 3.5. Excluir Registro de Descarte
* **Método:** `DELETE`
* **Rota:** `/api/discards/:id`
* **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "id": "disc-1774300999",
  "deleted": true
}
```

---

### 3.6. Gestão de Usuários
* **Método:** `GET` / `POST`
* **Rota:** `/api/users`
* **Descrição:** `GET` retorna todos os perfis cadastrados; `POST` sincroniza os dados cadastrais (telefone, veículo, bio).
* **Resposta de Sucesso no POST (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-coletor-1",
    "veiculo": "Caminhonete de Coleta Seletiva",
    "capacidadeCarga": "1.200 kg"
  }
}
```
