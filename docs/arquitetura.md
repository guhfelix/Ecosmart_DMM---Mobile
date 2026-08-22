# Arquitetura do EcoSmart Mobile

O EcoSmart Mobile é organizado como um ecossistema com três aplicativos independentes em React Native com Expo.

```text
Admin cadastra dados -> Cidadão registra descarte -> Empresa/Catador coleta -> Todos acompanham o status
```

## Aplicativos

```text
apps/
├── ecosmart-cidadao/
├── ecosmart-coletor/
└── ecosmart-admin/
```

Cada app possui:

- `App.tsx`: controla o fluxo principal e a navegação simples por estado.
- `src/screens/`: telas do perfil.
- `src/data/mockData.ts`: dados mockados para demonstração.
- `src/components/`: componentes locais reutilizáveis.
- `src/theme/`: cores e tokens visuais locais.

## Camada Compartilhada

```text
shared/
├── models/
├── services/
├── components/
├── utils/
└── theme/
```

No momento, o uso principal da camada compartilhada é `shared/models`, que concentra os modelos de domínio:

- usuários e perfis;
- autenticação local;
- descartes;
- tipos de resíduos;
- pontos de coleta;
- dicas educativas;
- registros administrativos.

Os apps importam esses modelos apenas como tipos TypeScript, usando `import type`.

## Estado Atual dos Dados

| Área | Estratégia atual |
|---|---|
| Login/cadastro | Estado local em memória, com credenciais fixas para teste |
| Cidadão | AsyncStorage para histórico de descartes |
| Coletor | Dados mockados e estado local em memória |
| Admin | Dados mockados e estado local em memória |

## Fluxo Atual

```text
1. Usuário acessa o app do seu perfil.
2. Usuário faz login com credencial de teste ou cria cadastro local.
3. App exibe as telas do perfil.
4. Ações do MVP são executadas localmente no dispositivo.
```

## Integração Futura

O próximo avanço arquitetural será criar uma camada de serviços para substituir mocks e estado local por backend.

Possíveis caminhos:

- Firebase;
- Supabase;
- API própria com Node.js, Django ou outro backend.

Essa etapa deve cuidar de:

- autenticação real;
- usuários por perfil;
- descartes;
- status de coleta;
- pontos de coleta;
- dicas educativas.
