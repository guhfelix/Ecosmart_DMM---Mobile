# Lean Canvas - EcoSmart Mobile

| Bloco | Descrição |
|---|---|
| Problema | Muitas pessoas têm dúvida sobre descarte correto e existe pouca conexão prática entre cidadãos, coletores e responsáveis pela gestão ambiental. |
| Segmentos de clientes | Cidadãos, coletores/cooperativas/empresas de coleta e administradores do sistema. |
| Proposta de valor | Facilitar o descarte sustentável por meio de um ecossistema mobile simples, dividido por perfil de uso. |
| Solução | Três aplicativos: Cidadão para registrar descartes, Empresa/Catador para visualizar e coletar resíduos, Admin para gerenciar dados e acompanhar registros. |
| Canais | Aplicativos mobile executados via Expo Go durante o MVP e GitHub para versionamento do projeto acadêmico. |
| Métricas principais | Quantidade de descartes registrados, coletas realizadas, pontos de coleta cadastrados e dicas educativas disponíveis. |
| Vantagem | Organização do fluxo completo em três perfis conectáveis, facilitando evolução futura para backend real. |

## MVP atual

- App Cidadão com login, cadastro, registro de descarte, histórico, dicas e pontos de coleta.
- App Empresa/Catador com login, cadastro, lista de descartes, filtros, detalhes e marcação de coleta.
- App Admin com login, cadastro, gerenciamento de resíduos, pontos, dicas e registros.
- Modelos principais padronizados em `shared/models`.
- Projeto validado com TypeScript nos três apps.

## Evolução futura

- Criar backend ou usar BaaS.
- Persistir usuários, descartes, coletas, pontos e dicas em banco de dados.
- Integrar dados reais entre os três aplicativos.
- Adicionar testes automatizados para Coletor e Admin.
