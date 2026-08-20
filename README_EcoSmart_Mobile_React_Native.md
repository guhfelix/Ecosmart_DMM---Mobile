# ♻️ EcoSmart Mobile

## Ecossistema Mobile para Descarte Sustentável de Resíduos

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue)
![Expo](https://img.shields.io/badge/Expo-Framework-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue)
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange)
![MVP](https://img.shields.io/badge/MVP-Mobile-green)
![License](https://img.shields.io/badge/license-academic-lightgrey)

---

## 📌 Sobre o projeto

O **EcoSmart Mobile** é um projeto acadêmico desenvolvido para a disciplina de **Dispositivos Móveis**, com o objetivo de criar um ecossistema de aplicativos voltado ao **descarte sustentável de resíduos**.

A proposta do projeto é conectar três perfis principais de usuários:

- cidadãos que desejam descartar resíduos corretamente;
- catadores, cooperativas ou empresas que realizam coleta, reciclagem ou reaproveitamento;
- administradores responsáveis por manter informações ambientais atualizadas.

O sistema será desenvolvido como um **MVP Mobile**, utilizando **React Native com Expo**, com foco em simplicidade, organização, persistência de dados, integração entre aplicativos e uso de serviços em nuvem.

---

## 🎯 Objetivo geral

Desenvolver um ecossistema mobile composto por três aplicativos integrados, capazes de apoiar o descarte correto de resíduos, facilitar a comunicação entre cidadãos e coletores, e permitir a administração de informações sobre tipos de resíduos, pontos de coleta e conteúdos educativos.

---

## 📱 Aplicativos do ecossistema

O projeto será dividido em três aplicativos principais, cada um voltado para um perfil de usuário.

---

### 👤 1. EcoSmart Cidadão

Aplicativo voltado para cidadãos, estudantes e moradores que desejam descartar resíduos corretamente.

#### Funcionalidades previstas no MVP

- Cadastro de descarte;
- Seleção do tipo de resíduo;
- Registro de quantidade aproximada;
- Histórico de descartes;
- Consulta a pontos de coleta;
- Consulta a dicas educativas;
- Visualização do status do descarte.

#### Exemplo de uso

O cidadão possui resíduos recicláveis ou eletrônicos e deseja descartá-los corretamente. Pelo aplicativo, ele registra o descarte, informa o tipo de resíduo e acompanha se o material foi visualizado ou coletado.

---

### 🚛 2. EcoSmart Empresa/Catador

Aplicativo voltado para catadores, cooperativas ou empresas que realizam coleta, reciclagem ou reaproveitamento de resíduos.

#### Funcionalidades previstas no MVP

- Visualizar descartes cadastrados pelos cidadãos;
- Filtrar resíduos por tipo;
- Consultar informações básicas do descarte;
- Marcar descarte como coletado;
- Visualizar lista de coletas realizadas.

#### Exemplo de uso

O catador acessa o aplicativo, visualiza os resíduos disponíveis, filtra por material reciclável e marca como coletado após realizar a retirada.

---

### 🛠️ 3. EcoSmart Admin

Aplicativo voltado para o administrador do sistema, responsável por manter os dados principais atualizados.

#### Funcionalidades previstas no MVP

- Cadastro de tipos de resíduos;
- Cadastro de pontos de coleta;
- Cadastro de dicas educativas;
- Visualização geral dos descartes registrados;
- Atualização e exclusão de informações cadastradas.

#### Exemplo de uso

O administrador cadastra novos pontos de coleta, atualiza dicas educativas e mantém os tipos de resíduos organizados para os demais aplicativos.

---

## 🧩 Problema identificado

Atualmente, muitas pessoas têm dificuldade para saber **como e onde descartar resíduos corretamente**.

Além disso:

- informações sobre pontos de coleta costumam estar espalhadas;
- cidadãos recorrem a pesquisas manuais na internet;
- catadores e cooperativas não possuem acesso organizado aos resíduos disponíveis;
- administradores precisam manter informações ambientais atualizadas;
- muitos resíduos acabam sendo descartados no lixo comum por falta de orientação.

---

## 💡 Solução proposta

O **EcoSmart Mobile** propõe um ecossistema de aplicativos simples e integrados, no qual cada perfil de usuário possui um aplicativo específico.

A solução permite:

- que o cidadão registre e acompanhe seus descartes;
- que catadores ou empresas visualizem resíduos disponíveis;
- que administradores cadastrem e atualizem informações ambientais;
- que os dados sejam organizados em uma base compartilhada.

---

## 🧠 Lean Canvas resumido

| Bloco | Descrição |
|---|---|
| **Problema** | Falta de orientação sobre descarte correto, baixa integração entre cidadãos e coletores, dificuldade de administração das informações ambientais. |
| **Solução** | Três aplicativos mobile: Cidadão, Empresa/Catador e Admin. |
| **Proposta de valor** | Conectar quem descarta, quem coleta e quem administra informações sobre resíduos. |
| **Segmentos de clientes** | Cidadãos, catadores, cooperativas, empresas de coleta e administradores. |
| **Métricas-chave** | Número de descartes registrados, coletas realizadas, usuários ativos e pontos de coleta cadastrados. |
| **Canais** | GitHub, apresentação acadêmica, testes em sala e demonstração prática. |

---

## 🛠️ Tecnologias previstas

| Tecnologia | Uso no projeto |
|---|---|
| **React Native** | Desenvolvimento dos aplicativos mobile |
| **Expo** | Facilitar criação, execução e testes dos apps |
| **TypeScript** | Linguagem principal da aplicação |
| **Firebase Authentication** | Login e autenticação de usuários |
| **Cloud Firestore** | Banco de dados em nuvem compartilhado |
| **Firebase Storage** | Armazenamento futuro de imagens |
| **React Navigation** | Navegação entre telas |
| **Context API ou Zustand** | Gerenciamento de estado |
| **AsyncStorage** | Persistência local simples |
| **Git e GitHub** | Versionamento e colaboração |
| **Figma ou Canva** | Protótipos e planejamento visual |

---

## 🏗️ Arquitetura proposta

A arquitetura do projeto será organizada de forma simples, buscando facilitar manutenção e evolução.

```text
EcoSmart Mobile
│
├── EcoSmart Cidadão
│   ├── Cadastro de descarte
│   ├── Histórico
│   ├── Dicas educativas
│   └── Pontos de coleta
│
├── EcoSmart Empresa/Catador
│   ├── Lista de descartes
│   ├── Filtros por tipo
│   ├── Detalhes do descarte
│   └── Marcar como coletado
│
├── EcoSmart Admin
│   ├── Cadastro de resíduos
│   ├── Cadastro de pontos de coleta
│   ├── Cadastro de dicas
│   └── Visualização geral
│
└── Firebase
    ├── Usuários
    ├── Descartes
    ├── Tipos de resíduos
    ├── Pontos de coleta
    └── Dicas educativas
```

---

## 📂 Estrutura inicial sugerida do repositório

A estrutura abaixo considera três aplicativos React Native com Expo dentro do mesmo repositório, compartilhando modelos, serviços e componentes reutilizáveis.

```text
ecosmart-mobile/
│
├── README.md
├── docs/
│   ├── lean-canvas.md
│   ├── requisitos.md
│   ├── personas.md
│   ├── jornada-usuario.md
│   ├── prototipos.md
│   └── planejamento.md
│
├── apps/
│   ├── ecosmart-cidadao/
│   ├── ecosmart-coletor/
│   └── ecosmart-admin/
│
├── shared/
│   ├── models/
│   ├── services/
│   ├── components/
│   ├── hooks/
│   ├── constants/
│   └── utils/
│
└── assets/
    ├── images/
    ├── icons/
    └── screenshots/
```

---

## 📁 Organização recomendada para cada aplicativo React Native

```text
src/
│
├── app/
│   ├── App.tsx
│   └── routes.tsx
│
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   └── SplashScreen.tsx
│
├── components/
│   ├── CustomButton.tsx
│   ├── CustomCard.tsx
│   └── CustomInput.tsx
│
├── models/
│   ├── Usuario.ts
│   ├── Descarte.ts
│   ├── Residuo.ts
│   └── PontoColeta.ts
│
├── services/
│   ├── authService.ts
│   ├── firestoreService.ts
│   └── storageService.ts
│
├── hooks/
│   └── useAuth.ts
│
├── contexts/
│   └── AuthContext.tsx
│
├── constants/
│   ├── colors.ts
│   └── routes.ts
│
└── utils/
    └── formatDate.ts
```

---

## 🗃️ Modelo inicial de dados

### Usuário

```text
usuarios
├── id
├── nome
├── email
├── tipo_usuario
│   ├── cidadao
│   ├── coletor
│   └── admin
└── data_cadastro
```

### Descarte

```text
descartes
├── id
├── usuario_id
├── tipo_residuo
├── quantidade
├── observacao
├── status
│   ├── pendente
│   ├── visualizado
│   └── coletado
├── data_cadastro
└── data_coleta
```

### Tipo de resíduo

```text
tipos_residuos
├── id
├── nome
├── descricao
└── orientacao_descarte
```

### Ponto de coleta

```text
pontos_coleta
├── id
├── nome
├── endereco
├── tipo_residuo_aceito
└── horario_funcionamento
```

### Dica educativa

```text
dicas
├── id
├── titulo
├── conteudo
├── categoria
└── data_publicacao
```

---

## ✅ Funcionalidades do MVP

### EcoSmart Cidadão

- [ ] Criar conta ou acessar perfil simulado;
- [ ] Registrar descarte;
- [ ] Escolher tipo de resíduo;
- [ ] Informar quantidade aproximada;
- [ ] Visualizar histórico;
- [ ] Consultar dicas educativas;
- [ ] Consultar pontos de coleta.

### EcoSmart Empresa/Catador

- [ ] Criar conta ou acessar perfil simulado;
- [ ] Visualizar descartes disponíveis;
- [ ] Filtrar descartes por tipo de resíduo;
- [ ] Visualizar detalhes do descarte;
- [ ] Marcar descarte como coletado;
- [ ] Consultar coletas realizadas.

### EcoSmart Admin

- [ ] Acessar área administrativa;
- [ ] Cadastrar tipo de resíduo;
- [ ] Editar tipo de resíduo;
- [ ] Cadastrar ponto de coleta;
- [ ] Editar ponto de coleta;
- [ ] Cadastrar dica educativa;
- [ ] Visualizar descartes registrados.

---

## 🚫 Fora do escopo do MVP

As funcionalidades abaixo são consideradas importantes, mas não serão implementadas na primeira versão:

- Chat entre cidadão e catador;
- Mapa em tempo real;
- Rotas automáticas de coleta;
- Pagamentos;
- Notificações push;
- Upload obrigatório de imagens;
- Relatórios avançados;
- Gamificação;
- Inteligência artificial;
- Painel web administrativo;
- Integração com sistemas externos.

---

## 🧪 Testes previstos

| Tipo de teste | Objetivo |
|---|---|
| Teste funcional | Verificar se cada funcionalidade principal funciona corretamente |
| Teste de interface | Avaliar se as telas são simples e compreensíveis |
| Teste de navegação | Verificar se o usuário consegue acessar as telas principais |
| Teste de persistência | Confirmar se os dados são salvos e recuperados corretamente |
| Teste de integração | Verificar comunicação com Firebase |
| Teste de usabilidade | Observar se usuários conseguem usar o app com facilidade |

---

## 📊 Métricas de avaliação

O MVP poderá ser avaliado com base nas seguintes métricas:

- quantidade de descartes registrados;
- quantidade de descartes marcados como coletados;
- quantidade de tipos de resíduos cadastrados;
- quantidade de pontos de coleta cadastrados;
- quantidade de dicas educativas cadastradas;
- facilidade de uso percebida pelos usuários;
- tempo necessário para registrar um descarte;
- clareza das informações apresentadas.

---

## 🗓️ Roadmap de desenvolvimento

### Etapa 1 — Planejamento

- [ ] Definir escopo do MVP;
- [ ] Criar Lean Canvas;
- [ ] Definir personas;
- [ ] Definir jornada do usuário;
- [ ] Levantar requisitos;
- [ ] Planejar telas principais.

### Etapa 2 — Protótipos

- [ ] Criar wireframes das telas;
- [ ] Criar protótipo visual;
- [ ] Validar fluxo dos três aplicativos;
- [ ] Ajustar navegação.

### Etapa 3 — Configuração do projeto

- [ ] Criar repositório no GitHub;
- [ ] Criar estrutura do projeto React Native;
- [ ] Configurar Expo;
- [ ] Configurar TypeScript;
- [ ] Configurar Firebase;
- [ ] Definir padrão de commits.

### Etapa 4 — Desenvolvimento do App Cidadão

- [ ] Criar tela inicial;
- [ ] Criar tela de cadastro de descarte;
- [ ] Criar tela de histórico;
- [ ] Criar tela de dicas educativas;
- [ ] Criar tela de pontos de coleta.

### Etapa 5 — Desenvolvimento do App Empresa/Catador

- [ ] Criar tela inicial;
- [ ] Criar lista de descartes disponíveis;
- [ ] Criar filtro por tipo de resíduo;
- [ ] Criar tela de detalhes;
- [ ] Criar função de marcar como coletado.

### Etapa 6 — Desenvolvimento do App Admin

- [ ] Criar tela inicial administrativa;
- [ ] Criar cadastro de tipos de resíduos;
- [ ] Criar cadastro de pontos de coleta;
- [ ] Criar cadastro de dicas educativas;
- [ ] Criar visualização geral dos descartes.

### Etapa 7 — Testes e ajustes

- [ ] Testar navegação;
- [ ] Testar cadastro de dados;
- [ ] Testar integração entre apps;
- [ ] Corrigir erros;
- [ ] Melhorar interface;
- [ ] Preparar apresentação final.

---

## 🔐 Regras básicas de segurança

- Cada usuário deve acessar apenas as funcionalidades do seu perfil;
- O cidadão não deve editar dados administrativos;
- O coletor não deve alterar dicas ou pontos de coleta;
- O administrador deve ser responsável pelos dados principais do sistema;
- Dados sensíveis não devem ser coletados no MVP;
- A aplicação deve armazenar apenas informações necessárias para o funcionamento.

---

## 🎨 Identidade visual sugerida

### Paleta de cores

| Cor | Uso sugerido |
|---|---|
| Verde | Sustentabilidade, botões principais e destaques |
| Branco | Fundo principal |
| Cinza claro | Cards, divisões e áreas secundárias |
| Azul | Informações e links |
| Vermelho/laranja | Alertas ou status pendente |

### Elementos visuais

- Ícones de reciclagem;
- Cards de resíduos;
- Listas simples;
- Botões grandes;
- Interface limpa;
- Linguagem objetiva.

---

## 🧑‍💻 Como executar o projeto

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js LTS;
- npm ou yarn;
- Expo CLI;
- Expo Go no celular ou emulador Android/iOS;
- Android Studio ou Visual Studio Code;
- Git;
- Conta no Firebase.

### Clonar o repositório

```bash
git clone https://github.com/seu-usuario/ecosmart-mobile.git
```

### Acessar a pasta do projeto

```bash
cd ecosmart-mobile
```

### Instalar dependências

Se o projeto estiver configurado como monorepo:

```bash
npm install
```

Se os apps estiverem separados, acesse o app desejado:

```bash
cd apps/ecosmart-cidadao
npm install
```

### Executar o aplicativo com Expo

```bash
npx expo start
```

Depois, abra o aplicativo pelo **Expo Go** no celular ou execute em um emulador.

### Executar diretamente no Android

```bash
npx expo run:android
```

### Executar diretamente no iOS

```bash
npx expo run:ios
```

---

## 📦 Comandos úteis para iniciar os aplicativos

### Criar o app do Cidadão

```bash
npx create-expo-app apps/ecosmart-cidadao --template blank-typescript
```

### Criar o app Empresa/Catador

```bash
npx create-expo-app apps/ecosmart-coletor --template blank-typescript
```

### Criar o app Admin

```bash
npx create-expo-app apps/ecosmart-admin --template blank-typescript
```

### Instalar React Navigation

```bash
npm install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/native-stack
```

### Instalar Firebase

```bash
npm install firebase
```

### Instalar AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

---

## 🌱 Possíveis melhorias futuras

- Integração com mapa;
- Geolocalização de pontos de coleta;
- Notificações para usuários;
- Upload de fotos dos resíduos;
- Ranking de usuários sustentáveis;
- Relatórios ambientais;
- Painel web para administradores;
- Integração com prefeituras;
- Integração com cooperativas reais;
- Publicação na Play Store.

---

## 📚 Contexto acadêmico

Este projeto foi desenvolvido como atividade prática da disciplina de **Dispositivos Móveis**, com foco na criação de um MVP utilizando tecnologias mobile.

A proposta permite aplicar conceitos como:

- desenvolvimento de aplicações móveis;
- arquitetura de aplicativos;
- componentes de interface;
- persistência de dados;
- integração com serviços em nuvem;
- boas práticas de design;
- versionamento com Git e GitHub;
- desenvolvimento incremental.

---

## 📄 Licença

Este projeto possui finalidade acadêmica e está sendo desenvolvido para fins de aprendizagem.

---

## ♻️ EcoSmart Mobile

**Conectando cidadãos, coletores e administradores para um descarte mais sustentável.**
