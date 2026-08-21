# ♻️ EcoSmart Mobile

## Ecossistema Mobile para Descarte Sustentável de Resíduos

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue)
![Expo](https://img.shields.io/badge/Expo-Framework-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue)
![MVP](https://img.shields.io/badge/MVP-Mobile-green)
![License](https://img.shields.io/badge/license-academic-lightgrey)

---

## 📌 Sobre o projeto

O **EcoSmart Mobile** é um projeto acadêmico desenvolvido para a disciplina de **Dispositivos Móveis**, com o objetivo de criar um ecossistema de aplicativos voltado ao **descarte sustentável de resíduos**.

O projeto será desenvolvido em **React Native com Expo** e organizado em **três aplicativos independentes**, cada um destinado a um perfil de usuário:

- **EcoSmart Cidadão:** aplicativo para cidadãos, estudantes e moradores que desejam registrar descartes, consultar dicas educativas e visualizar pontos de coleta.
- **EcoSmart Empresa/Catador:** aplicativo para catadores, cooperativas ou empresas que desejam visualizar resíduos disponíveis e marcar coletas como realizadas.
- **EcoSmart Admin:** aplicativo para administradores responsáveis por cadastrar tipos de resíduos, pontos de coleta e conteúdos educativos.

Os três aplicativos fazem parte do mesmo ecossistema e poderão compartilhar a mesma base de dados, permitindo integração entre quem descarta, quem coleta e quem administra as informações.

---

## 🎯 Objetivo geral

Desenvolver um ecossistema mobile composto por três aplicativos em React Native, capazes de apoiar o descarte correto de resíduos, facilitar a comunicação entre cidadãos e coletores, e permitir a administração de informações sobre resíduos, pontos de coleta e conteúdos educativos.

---

## 📱 Aplicativos do ecossistema

| Aplicativo | Perfil | Função principal |
|---|---|---|
| **EcoSmart Cidadão** | Cidadão | Registrar descartes e consultar informações |
| **EcoSmart Empresa/Catador** | Empresa/Catador | Visualizar resíduos disponíveis e marcar coletas |
| **EcoSmart Admin** | Administrador | Gerenciar dados básicos do ecossistema |

---

## 🛠️ Tecnologias previstas

| Tecnologia | Uso no projeto |
|---|---|
| **React Native** | Desenvolvimento mobile |
| **Expo** | Execução, testes e empacotamento dos aplicativos |
| **TypeScript** | Organização e segurança no código |
| **AsyncStorage** | Persistência local futura |
| **Firebase ou Supabase** | Banco de dados compartilhado em etapa futura |
| **Git e GitHub** | Versionamento |
| **Figma ou Canva** | Prototipação e planejamento visual |

---

## 📂 Estrutura do repositório

```text
Ecosmart_DMM---Mobile/
│
├── README.md
├── docs/
│   ├── arquitetura.md
│   ├── requisitos.md
│   ├── roadmap.md
│   └── comandos-git.md
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
│   ├── utils/
│   └── theme/
│
└── assets/
    ├── images/
    ├── icons/
    └── screenshots/
```

---

## ✅ Funcionalidades do MVP

### EcoSmart Cidadão

- [ ] Tela inicial;
- [ ] Cadastro de descarte;
- [ ] Seleção de tipo de resíduo;
- [ ] Histórico de descartes;
- [ ] Dicas educativas;
- [ ] Pontos de coleta.

### EcoSmart Empresa/Catador

- [ ] Tela inicial;
- [ ] Lista de descartes disponíveis;
- [ ] Filtro por tipo de resíduo;
- [ ] Detalhes do descarte;
- [ ] Marcar como coletado;
- [ ] Lista de coletas realizadas.

### EcoSmart Admin

- [ ] Tela inicial administrativa;
- [ ] Gerenciar tipos de resíduos;
- [ ] Gerenciar pontos de coleta;
- [ ] Gerenciar dicas educativas;
- [ ] Visualizar descartes registrados.

---

## 🧑‍💻 Como executar os aplicativos

### App Cidadão

```bash
cd apps/ecosmart-cidadao
npm install
npx expo start
```

### App Empresa/Catador

```bash
cd apps/ecosmart-coletor
npm install
npx expo start
```

### App Admin

```bash
cd apps/ecosmart-admin
npm install
npx expo start
```

---

## 📄 Licença

Este projeto possui finalidade acadêmica e está sendo desenvolvido para fins de aprendizagem.

---

## ♻️ EcoSmart Mobile

**Conectando cidadãos, coletores e administradores para um descarte mais sustentável.**
