# Requisitos do MVP

Este documento descreve os requisitos funcionais já implementados no MVP mobile do EcoSmart.

## Requisitos Gerais

- [x] Cada app deve possuir tela de login.
- [x] Cada app deve permitir cadastro simples local.
- [x] Cada app deve possuir botão para sair da sessão.
- [x] Cada perfil deve ter credenciais de teste.
- [x] Os aplicativos devem rodar com Expo SDK 54.
- [x] Os principais modelos do domínio devem estar centralizados em `shared/models`.

## EcoSmart Cidadão

- [x] Realizar login com usuário cidadão.
- [x] Criar cadastro simples local.
- [x] Registrar descarte.
- [x] Selecionar tipo de resíduo.
- [x] Informar quantidade e observação.
- [x] Consultar histórico de descartes.
- [x] Consultar dicas educativas.
- [x] Consultar pontos de coleta.
- [x] Persistir descartes localmente com AsyncStorage.

## EcoSmart Empresa/Catador

- [x] Realizar login com usuário coletor.
- [x] Criar cadastro simples local.
- [x] Visualizar descartes disponíveis.
- [x] Filtrar descartes por tipo de resíduo.
- [x] Consultar detalhes do descarte.
- [x] Marcar descarte como coletado.
- [x] Visualizar coletas realizadas.

## EcoSmart Admin

- [x] Realizar login com usuário administrador.
- [x] Criar cadastro simples local.
- [x] Cadastrar, editar e excluir tipos de resíduos.
- [x] Cadastrar, editar e excluir pontos de coleta.
- [x] Cadastrar, editar e excluir dicas educativas.
- [x] Visualizar registros gerais.
- [x] Filtrar registros por status.
- [x] Exibir resumo de registros pendentes, visualizados e coletados.

## Requisitos Futuros

- [ ] Persistir dados do Coletor e Admin localmente.
- [ ] Criar backend para autenticação real.
- [ ] Integrar descartes, coletas, pontos e dicas em uma base compartilhada.
- [ ] Adicionar testes automatizados para Coletor e Admin.
- [ ] Melhorar compatibilidade de teste Android em redes bloqueadas usando tunnel.
