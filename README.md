# EcoSmart Mobile

## Ecossistema mobile para descarte sustentável de resíduos

![Status](https://img.shields.io/badge/status-MVP%20funcional-green)
![React Native](https://img.shields.io/badge/React%20Native-Mobile-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![License](https://img.shields.io/badge/license-academic-lightgrey)

O **EcoSmart Mobile** é um projeto acadêmico desenvolvido para a disciplina de **Dispositivos Móveis**. A proposta é organizar um ecossistema de aplicativos para apoiar o descarte correto de resíduos, conectar cidadãos a coletores e permitir que administradores mantenham os dados básicos do sistema.

O projeto está organizado em três aplicativos independentes, todos em **React Native com Expo**:

| Aplicativo | Perfil | Status | Função principal |
|---|---|---|---|
| **EcoSmart Cidadão** | Cidadão | MVP funcional | Registrar descartes, consultar histórico, dicas e pontos de coleta |
| **EcoSmart Empresa/Catador** | Coletor | MVP funcional | Visualizar descartes disponíveis, filtrar, consultar detalhes e marcar coletas |
| **EcoSmart Admin** | Administrador | MVP funcional | Gerenciar resíduos, pontos de coleta, dicas educativas e registros gerais |

## Funcionalidades Implementadas

### Login e cadastro

Os três apps possuem uma tela inicial de autenticação com alternância entre **Entrar** e **Cadastrar**. O cadastro é local e simples, voltado para demonstração do MVP.

Credenciais de teste:

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `joao@gmail.com` | `1234` |
| Cidadão | `maria@gmail.com` | `1234` |
| Coletor | `lucas@gmail.com` | `1234` |

### EcoSmart Cidadão

- [x] Login e cadastro simples.
- [x] Tela inicial com navegação.
- [x] Cadastro de descarte.
- [x] Seleção de tipo de resíduo.
- [x] Histórico de descartes.
- [x] Dicas educativas.
- [x] Pontos de coleta.
- [x] Persistência local dos descartes com AsyncStorage.
- [x] Testes básicos da Home.

### EcoSmart Empresa/Catador

- [x] Login e cadastro simples.
- [x] Tela inicial com navegação.
- [x] Lista de descartes disponíveis.
- [x] Filtro por tipo de resíduo.
- [x] Tela de detalhes do descarte.
- [x] Marcar descarte como coletado.
- [x] Lista de coletas realizadas.

### EcoSmart Admin

- [x] Login e cadastro simples.
- [x] Tela inicial administrativa.
- [x] Gerenciar tipos de resíduos.
- [x] Gerenciar pontos de coleta.
- [x] Gerenciar dicas educativas.
- [x] Visualizar registros gerais.
- [x] Filtrar registros por status.
- [x] Resumo de registros pendentes, visualizados e coletados.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **React Native** | Desenvolvimento mobile |
| **Expo SDK 54** | Execução e empacotamento dos apps |
| **TypeScript** | Tipagem e organização do código |
| **AsyncStorage** | Persistência local no app Cidadão |
| **Jest / jest-expo** | Testes do app Cidadão |
| **Git e GitHub** | Versionamento |

## Estrutura do Repositório

```text
Ecosmart_DMM---Mobile/
├── README.md
├── docs/
│   ├── arquitetura.md
│   ├── comandos-git.md
│   ├── jornadas.md
│   ├── lean-canvas.md
│   ├── personas.md
│   ├── requisitos.md
│   └── roadmap.md
├── apps/
│   ├── ecosmart-cidadao/
│   ├── ecosmart-coletor/
│   └── ecosmart-admin/
├── shared/
│   ├── models/
│   ├── services/
│   ├── components/
│   ├── utils/
│   └── theme/
└── assets/
    ├── images/
    ├── icons/
    └── screenshots/
```

## Modelos Compartilhados

O diretório `shared/models` concentra os principais tipos do ecossistema:

- `PerfilUsuario`
- `Usuario`
- `AuthUserInput`
- `Descarte`
- `DiscardItem`
- `CollectorDiscard`
- `WasteTypeItem`
- `CollectionPointItem`
- `EducationalTipItem`
- `AdminDiscardRecord`

Os apps usam esses modelos como imports de tipo, mantendo a organização sem criar dependências de execução entre as pastas dos apps.

## Como Executar

Instale as dependências dentro do app desejado e inicie com Expo:

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

Para rodar os três ao mesmo tempo, use portas diferentes:

```bash
cd apps/ecosmart-cidadao
npx expo start --port 8081
```

```bash
cd apps/ecosmart-coletor
npx expo start --port 8082
```

```bash
cd apps/ecosmart-admin
npx expo start --port 8083
```

Depois, abra o QR code no **Expo Go** no iOS ou Android.

> Em redes institucionais, o Android pode não conseguir acessar o computador pela rede local. Nesse caso, use uma rede particular, hotspot ou o modo tunnel do Expo.

## Validação

Comando usado para validar TypeScript em cada app:

```bash
npx tsc --noEmit
```

No app Cidadão:

```bash
npm test
```

Checagem recomendada antes de uma entrega final:

```bash
npx expo-doctor
```

## Limitações Atuais

- O projeto ainda não possui backend.
- Login e cadastro são locais e simplificados para teste do MVP.
- Dados de Admin e Coletor usam estado local/mockado.
- Integração com Firebase, Supabase ou API própria fica para uma etapa futura.

## Próximos Passos

- Melhorar teste em Android usando tunnel ou rede sem bloqueio.
- Adicionar persistência local também no Coletor e Admin.
- Substituir `SafeAreaView` deprecated por `react-native-safe-area-context`.
- Criar testes básicos para Coletor e Admin.
- Planejar backend para autenticação, descartes, pontos de coleta e dicas.

## Licença

Projeto acadêmico desenvolvido para fins de aprendizagem.
