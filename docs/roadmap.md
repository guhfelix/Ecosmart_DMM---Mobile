# Roadmap

## Etapa 1 - Estrutura inicial

Status: concluída.

- [x] Estruturar repositório.
- [x] Criar os três apps base.
- [x] Organizar pastas `apps`, `shared`, `docs` e `assets`.

## Etapa 2 - App Cidadão

Status: concluída para MVP local.

- [x] Implementar login e cadastro simples.
- [x] Criar tela inicial.
- [x] Implementar cadastro de descarte.
- [x] Implementar histórico.
- [x] Implementar dicas educativas.
- [x] Implementar pontos de coleta.
- [x] Persistir descartes com AsyncStorage.

## Etapa 3 - App Empresa/Catador

Status: concluída para MVP local.

- [x] Implementar login e cadastro simples.
- [x] Listar descartes disponíveis.
- [x] Filtrar por tipo de resíduo.
- [x] Consultar detalhes.
- [x] Marcar descarte como coletado.
- [x] Exibir coletas realizadas.

## Etapa 4 - App Admin

Status: concluída para MVP local.

- [x] Implementar login e cadastro simples.
- [x] Gerenciar tipos de resíduos.
- [x] Gerenciar pontos de coleta.
- [x] Gerenciar dicas educativas.
- [x] Visualizar registros gerais.
- [x] Filtrar registros por status.

## Etapa 5 - Padronização e validação

Status: em andamento.

- [x] Padronizar apps no Expo SDK 54.
- [x] Centralizar modelos principais em `shared/models`.
- [x] Validar TypeScript nos três apps.
- [ ] Validar Expo Doctor nos três apps antes da entrega final.
- [x] Criar testes básicos do app Cidadão.
- [ ] Criar testes básicos do Coletor.
- [ ] Criar testes básicos do Admin.
- [ ] Atualizar SafeAreaView para `react-native-safe-area-context`.

## Etapa 6 - Integração futura

Status: planejada.

- [ ] Definir backend ou BaaS.
- [ ] Implementar autenticação real.
- [ ] Persistir usuários, descartes, pontos e dicas.
- [ ] Integrar fluxo entre Cidadão, Coletor e Admin.
- [ ] Preparar versão de demonstração final.
