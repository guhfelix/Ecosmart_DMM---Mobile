# Guia de Configuração e Deploy do Firebase - EcoSmart Mobile

Este documento orienta o provisionamento, configuração de segurança, deploy de regras, índices e scripts de carga para o projeto **EcoSmart Mobile** no Google Firebase.

---

## 1. Pré-Requisitos
* **Node.js:** Versão 20 LTS ou superior.
* **Firebase CLI:** Instalado globalmente via npm:
  ```bash
  npm install -g firebase-tools
  ```
* **Conta Google:** Com permissão de *Editor* ou *Owner* no projeto Firebase.

---

## 2. Provisionamento no Console do Firebase

O arquivo `.firebaserc` na raiz do projeto aponta para o ID oficial:
```json
{
  "projects": {
    "default": "ecosmart-mobile"
  }
}
```

Caso você esteja configurando um novo ambiente de homologação ou produção:

### 2.1. Criar o Projeto
1. Acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Clique em **"Adicionar projeto"** e informe o nome (ex.: `ecosmart-mobile`).
3. Desative ou configure o Google Analytics conforme preferência acadêmica/corporativa.

### 2.2. Habilitar o Firebase Authentication
1. No menu lateral, navegue até **Build -> Authentication**.
2. Clique em **"Começar" (Get Started)**.
3. Em **"Sign-in method"**, ative os seguintes provedores:
   * **E-mail/senha:** Ative a opção principal e mantenha desmarcado o link do e-mail.
   * **Google:** Ative o provedor e selecione o e-mail de suporte do projeto.
4. Crie o usuário administrador para testes de carga:
   * **E-mail:** `admin.caceres@ecosmart.com`
   * **Senha:** `Password@1234`

### 2.3. Habilitar o Cloud Firestore
1. No menu lateral, clique em **Build -> Firestore Database**.
2. Clique em **"Criar banco de dados"**.
3. Selecione a localização: recomendada **`southamerica-east1` (São Paulo)**.
4. Escolha iniciar em **Modo de Produção** (as regras oficiais serão implantadas via CLI).

### 2.4. Habilitar o Firebase Storage
1. Navegue até **Build -> Storage**.
2. Clique em **"Começar"**, selecione a mesma região e confirme as regras iniciais.

---

## 3. Autenticação e Login na Firebase CLI

Abra o terminal na raiz do projeto (`Ecosmart_DMM---Mobile`):

```bash
# 1. Realizar login na sua conta Google
firebase login

# 2. Confirmar o projeto ativo
firebase projects:list
firebase use ecosmart-mobile
```

---

## 4. Deploy de Regras de Segurança e Índices

O arquivo `firebase.json` está configurado para direcionar as regras e índices:
```json
{
  "firestore": {
    "rules": "database/schemas/firestore.rules",
    "indexes": "database/schemas/firestore.indexes.json"
  }
}
```

### 4.1. Deploy das Regras do Cloud Firestore
Executa a validação sintática e publica as regras de segurança RBAC:
```bash
firebase deploy --only firestore:rules
```

> **Verificação das Regras:**
> As regras em `database/schemas/firestore.rules` garantem que:
> * **Área Administrativa Blindada:** Coleções raiz `/admins/{adminId}` e `/admin_logs/{logId}` acessíveis exclusivamente por administradores (`allow read, write: if isAdmin();`). Totalmente inacessíveis para usuários comuns.
> * **Coleção de Usuários Operacionais:** Em `/usuarios/{userId}`, apenas cidadãos e coletores leem e atualizam seus próprios dados (`isOwner(userId)`). Administradores possuem acesso completo para gestão do sistema.
> * **Descartes:** Cidadãos gerenciam seus descartes, coletores consultam e dão baixa em coletas, e administradores possuem permissão total para auditoria e governança ESG.
> * **Catálogos:** Coleções municipais (`tipos_residuos`, `pontos_coleta`, `dicas_educativas`) são públicas para leitura por qualquer usuário autenticado, mas restritas a administradores para criação, edição e exclusão.

### 4.2. Deploy dos Índices Compostos
```bash
firebase deploy --only firestore:indexes
```

### 4.3. Deploy do Firebase Functions (se aplicável)
```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 4.4. Deploy do Firebase Data Connect (se aplicável)
```bash
firebase deploy --only dataconnect
```

---

## 5. Execução do Script de Carga e Migração (Seeding Oficial)

O projeto possui um script automatizado que realiza a higienização de registros de teste, migra administradores para a coleção isolada e injeta os dados geoespaciais oficiais de **Cáceres - MT**:
* 2 Usuários comuns em `/usuarios` (`maria@gmail.com` [Cidadão], `lucas@gmail.com` [Coletor]).
* 1 Administrador exclusivo em `/admins` (`joao@gmail.com` [Admin]).
* Exclusão explícita de qualquer credencial administrativa da coleção `/usuarios`.
* 6 Tipos de resíduos recicláveis oficiais.
* 6 Ecopontos/PEVs reais de Cáceres com coordenadas GPS (Praça Barão, COOPERCÁCERES, Cavalhada, Cohab Nova, UNEMAT, DNER).
* 6 Dicas educativas voltadas à preservação do Rio Paraguai e Pantanal.

Para executar o seed e a migração no Cloud Firestore:
```bash
node scripts/seed-firestore.js
```

**Saída esperada:**
```text
=================================================================
🌱 LIMPEZA DE DADOS E MIGRAÇÃO DE ISOLAMENTO NO FIREBASE FIRESTORE
=================================================================
🔐 Autenticado como Administrador no Firebase: admin.caceres@ecosmart.com (RJF5CfRle2Um3Ha0tJnpELyTI082)

🗑️ 1. Removendo todos os registros antigos de descartes e notificações...
🧹 Coleção 'descartes': 0 documento(s) removido(s) com sucesso.
🧹 Coleção 'notificacoes': 0 documento(s) removido(s) com sucesso.

👥 2. Limpando e isolando a coleção de usuários comuns (usuarios)...
  🧹 Exclusão explícita de 'user-admin-1' da coleção 'usuarios': SUCESSO
  🧹 Exclusão da conta de admin RJF5CfRle2Um3Ha0tJnpELyTI082 de 'usuarios': SUCESSO
  ✅ Usuário comum cadastrado em 'usuarios': Maria Cidadã Pantaneira (maria@gmail.com) - Perfil: cidadao
  ✅ Usuário comum cadastrado em 'usuarios': Lucas Coletor COOPERCÁCERES (lucas@gmail.com) - Perfil: coletor

👑 3. Migrando e sincronizando Administradores na coleção raiz exclusiva 'admins'...
  ✅ Administrador cadastrado em 'admins': João Gestor SEMATUR (joao@gmail.com)
  ✅ Conta auth migrada para 'admins': admin.caceres@ecosmart.com (RJF5CfRle2Um3Ha0tJnpELyTI082)

♻️ 4. Sincronizando Tipos de Resíduos oficiais...
  ✅ 6 Tipos de Resíduos cadastrados no Firestore.

📍 5. Sincronizando Pontos de Coleta e Ecopontos reais de Cáceres...
  ✅ 6 Ecopontos e Locais de Coleta cadastrados no Firestore.

💡 6. Sincronizando Dicas Educativas de Sustentabilidade...
  ✅ 6 Dicas Educativas cadastradas no Firestore.

=================================================================
🎉 MIGRAÇÃO E SINCRONIZAÇÃO FIREBASE CONCLUÍDAS COM SUCESSO!
=================================================================
```

---

## 6. Verificação de Integridade e Testes Automatizados

Após configurar o Firebase e o backend, valide toda a suíte de testes do monorepo:

```bash
# 1. Testar comunicação de rede e sincronização (API REST + Firestore)
npm run test:communication

# 2. Executar checagem estática de tipos TypeScript em todos os módulos
npm run typecheck:all

# 3. Executar todos os testes automatizados (77 suítes / 425 testes)
npm run test:all
```
