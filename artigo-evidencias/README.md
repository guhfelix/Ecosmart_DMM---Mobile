# Testes automatizados e evidências de validação

## Resultado da execução de 14/11/2026

Os arquivos dos testes já estavam versionados no repositório. Este envio publica as evidências de execução e explica o que os testes verificam.

| Aplicativo | Suítes aprovadas | Testes aprovados | Falhas |
| --- | ---: | ---: | ---: |
| Cidadão | 26 | 160 | 0 |
| Coletor | 25 | 154 | 0 |
| Admin | 26 | 158 | 0 |
| **Total** | **77** | **472** | **0** |

As três execuções Jest terminaram com código de saída 0, sem testes ignorados e sem snapshots. Os testes compartilhados são executados nas cópias de `src/` de cada aplicativo; portanto, os 472 resultados incluem cenários comuns repetidos nos três apps, não 472 regras de negócio diferentes.

Também passaram a verificação estática TypeScript dos três aplicativos e do backend (`npm run typecheck:all`) e o diagnóstico HTTP de comunicação (`scripts/test-communication.js`).

## O que foi testado

| Área | Cenários verificados | Arquivos de referência |
| --- | --- | --- |
| Autenticação e perfis | Login válido e inválido, cadastro duplicado, recuperação de senha, bloqueio de perfil incompatível, exigência de autorização administrativa e propagação de falhas do provedor Google. | `shared/services/__tests__/authService.test.ts` e `frontend/*/src/screens/__tests__/AuthScreen.test.tsx` |
| Proteção de credenciais e acesso | Remoção de senha em texto simples ao preparar dados para armazenamento, geração e verificação de hash, tokens de sessão e restrições de acesso a coleções administrativas na lógica local. | `shared/services/__tests__/securityService.test.ts` |
| Isolamento de dados | Filtro de descartes por usuário, limpeza do cache de sessão, separação das chaves de armazenamento por aplicativo e recusa de administrador na coleção de usuários comuns. | `shared/services/__tests__/dataIsolation.test.ts` e `storageKeys.test.ts` |
| Operação offline | Persistência e recarga da fila de mutações no AsyncStorage simulado, manutenção de pendências após falha, retirada da fila após confirmação, conciliação de registros e exclusões com tombstones. | `shared/services/__tests__/syncService.test.ts` |
| Comunicação dos serviços | Busca, criação, edição preservando o ID, baixa de coleta, exclusão, sincronização de perfil, retorno de erro HTTP, configuração da URL e recuperação da saúde do servidor, com respostas controladas nos testes Jest. | `shared/services/__tests__/crossAppSync.test.ts` |
| Serviço Firebase | Operações de descarte e catálogos, consultas, cache, configuração das coleções e reutilização da instância de autenticação no ambiente de teste. | `shared/services/__tests__/firebaseService.test.ts` e `firebaseConfig.test.ts` |
| Cidadão | Registro online e offline, validação de quantidade e unidade, edição com o mesmo ID, busca de CEP, histórico com busca e filtros, pontos de coleta, dicas e perfil. | `frontend/ecosmart-cidadao/src/screens/__tests__/` |
| Coletor | Listagem e filtros de descartes, detalhes, abertura da navegação, baixa de coleta, aviso offline, histórico de coletados e perfil. | `frontend/ecosmart-coletor/src/screens/__tests__/` |
| Administrador | Cadastro, listagem, edição e exclusão de tipos de resíduos, pontos de coleta e dicas; consulta e filtros de registros; abertura da exportação ESG e edição do perfil. | `frontend/ecosmart-admin/src/screens/__tests__/` |
| Relatórios e notificações | Cálculo de métricas, lista vazia, formatação CSV, criação de notificações, marcação como lidas e contagem de não lidas. | `shared/services/__tests__/reportService.test.ts` e `notificationService.test.ts` |
| Componentes e conexão | Cards, modal de notificações, estado vazio, identificação de conexão, banner offline, contador de pendências e botão para sincronizar. | `shared/components/__tests__/` e `shared/hooks/__tests__/` |
| Validações e localização | E-mail, senha, nome, telefone, sanitização, quantidade, UUIDs, formatação e consulta de CEP com respostas simuladas, cálculo de distância, ordenação por proximidade e URLs de navegação. | `shared/utils/__tests__/` e `shared/services/__tests__/cepService.test.ts` |

As referências em `shared/` representam os cenários comuns, copiados para os aplicativos. Os relatórios de cobertura registram os arquivos efetivamente executados em cada `src/`.

## Diagnóstico HTTP da API

O script existente foi executado contra uma instância local de `scripts/sync-server.js`, em porta livre, com as gravações direcionadas a um arquivo temporário por `ECOSMART_DB_FILE`. A instância foi encerrada e o arquivo temporário foi removido após o diagnóstico. O banco de trabalho não recebeu as gravações do teste.

O [log de comunicação](validacao-2026-11-14/comunicacao.txt) registra sucesso nestas operações:

1. Resposta de saúde do servidor em `GET /api/health`.
2. Criação de um descarte em `POST /api/discards`.
3. Edição em `PUT /api/discards/:id`, preservando o ID, e localização na consulta `GET /api/discards`.
4. Baixa de coleta em `POST /api/discards/:id/collect`.
5. Exclusão do registro de teste em `DELETE /api/discards/:id`.

As verificações de namespaces locais e de métodos/listeners Firestore feitas por esse script consistem em leitura do código-fonte. Elas não executam acesso ao Firestore remoto. Além disso, o resultado agregado atual do script não inclui os resultados da edição e da exclusão: nesta execução, o sucesso dessas etapas foi conferido nas mensagens específicas do log. O script não faz uma nova leitura depois da exclusão nem confere todos os campos persistidos depois da edição.

## Cobertura medida

| Aplicativo | Instruções | Ramificações | Funções | Linhas |
| --- | ---: | ---: | ---: | ---: |
| Cidadão | 64,30% | 52,02% | 65,12% | 65,31% |
| Coletor | 62,37% | 49,94% | 63,46% | 63,50% |
| Admin | 63,99% | 50,85% | 65,06% | 64,95% |

A coleta usa o `collectCoverageFrom` dos arquivos `jest.config.js`: `src/**/*.{ts,tsx}`, excluindo declarações e os próprios testes. Esses percentuais não representam cobertura do backend, de regras Firestore implantadas ou de todo o monorepo. Os logs mostram as linhas que ainda não foram exercitadas.

## Ambiente e rastreabilidade

A referência do código foi o commit `8512d2c39e8abcc37bc63ea99ed0fc860317b148`, com alterações locais preexistentes. Entre os arquivos de aplicação havia uma URL de rede local gerada em `crossAppSync.ts` nos três apps; os hashes dos arquivos de serviço presentes na execução estão no [resumo estruturado](validacao-2026-11-14/resumo.json).

Foram usadas as dependências já instaladas: Node.js 22.15.0, npm 10.9.2, Expo 57.0.26, React 19.2.3, React Native 0.86.3, Jest 29.7.0 e TypeScript 6.0.3. Os manifestos atuais declaram algumas versões diferentes, incluindo Expo `~58.0.0`, React `19.3.0`, React Native `0.88.1` e Jest `~30.5.2`. O resultado comprova a execução com as versões instaladas, não a compatibilidade com uma instalação limpa das versões declaradas.

| Evidência atual | Conteúdo |
| --- | --- |
| [Testes do Cidadão](validacao-2026-11-14/testes-cidadao.txt) | Resultado das 26 suítes e cobertura por arquivo. |
| [Testes do Coletor](validacao-2026-11-14/testes-coletor.txt) | Resultado das 25 suítes e cobertura por arquivo. |
| [Testes do Admin](validacao-2026-11-14/testes-admin.txt) | Resultado das 26 suítes e cobertura por arquivo. |
| [TypeScript](validacao-2026-11-14/typecheck.txt) | Comando executado para os três frontends e o backend; saída sem erros de tipos. |
| [Comunicação](validacao-2026-11-14/comunicacao.txt) | Etapas HTTP e verificações estruturais do diagnóstico. |
| [Resumo JSON](validacao-2026-11-14/resumo.json) | Comandos, versões instaladas e declaradas, totais de cobertura, hashes e códigos de saída. |

## Como executar novamente

Com as dependências disponíveis, execute na raiz:

```bash
# Cada comando usa o src/ atual do aplicativo, sem copiar shared/.
npm --prefix frontend/ecosmart-cidadao run test:coverage -- --runInBand
npm --prefix frontend/ecosmart-coletor run test:coverage -- --runInBand
npm --prefix frontend/ecosmart-admin run test:coverage -- --runInBand
npm run typecheck:all
```

Para repetir exatamente os argumentos de cobertura desta rodada, execute dentro de cada diretório `frontend/ecosmart-*`:

```bash
node node_modules/jest/bin/jest.js --watch=false --runInBand --coverage --coverageReporters=text --coverageReporters=json-summary
```

Os comandos globais `npm run test:all` e `npm run test:coverage` também estão disponíveis, mas primeiro executam `sync-shared.js`, que copia arquivos de `shared/` para os apps. Nesta rodada, os testes foram chamados diretamente para preservar o estado local dos aplicativos.

O diagnóstico padrão é `npm run test:communication`: ele usa a porta 3333 ou a variável `PORT`, pode iniciar um servidor e cria, edita e remove um registro. Para direcionar as gravações a um arquivo separado, configure `ECOSMART_DB_FILE` antes de iniciar uma nova instância do servidor; a variável não altera o arquivo de leitura inicial. Uma instância já ativa mantém a própria configuração.

No PowerShell com execução de scripts desabilitada, use `npm.cmd` no lugar de `npm`.

## Limites da validação

Os testes Jest exercitam componentes e serviços com mocks, respostas controladas e cache local. A execução HTTP usa o servidor Node real em ambiente local. Não foram executados testes em dispositivos Android/iOS, automação de ponta a ponta das telas, GPS físico, autenticação Google real, entrega de eventos entre dispositivos, testes de carga ou validação das regras e permissões de um Firebase implantado. A verificação TypeScript detecta erros de tipos; ela não comprova o comportamento em execução.

## Evidências anteriores

Os arquivos [ambiente.txt](ambiente.txt), [test-all.txt](test-all.txt), [coverage.txt](coverage.txt), [typecheck.txt](typecheck.txt) e [communication.txt](communication.txt) foram preservados como registros históricos encontrados no workspace. Para permitir leitura e revisão no GitHub, os logs foram convertidos de UTF-16 para UTF-8, removendo cores ANSI e espaços no final das linhas, sem alterar os resultados. O ambiente registrado aponta para o commit `7e791fd`, e o diagnóstico HTTP contém a data de 19/10/2026.

Essa rodada anterior registrou **425 testes aprovados em 77 suítes** (143 Cidadão, 139 Coletor e 143 Admin), com cobertura de linhas de 70,38%, 68,22% e 69,95%, respectivamente. O log TypeScript antigo só lista os três frontends; o backend foi incluído na rodada atual. Os arquivos históricos não contêm um registro explícito dos códigos de saída. As mensagens `NativeCommandError` nos logs antigos são a formatação do PowerShell ao capturar saída nativa; os resultados Jest ao final registram as aprovações.

Os números históricos e atuais pertencem a estados diferentes do código e do ambiente e não devem ser combinados como se fossem uma única execução.
