# Jornadas

Este documento descreve as jornadas principais dos três perfis do EcoSmart Mobile no MVP atual.

## Cidadão

Credencial de teste:

```text
E-mail: maria@gmail.com
Senha: 1234
```

Jornada:

1. Abre o app EcoSmart Cidadão.
2. Entra com a credencial de teste ou cria um cadastro local simples.
3. Acessa a tela inicial do perfil.
4. Registra um descarte informando tipo de resíduo, quantidade e observações.
5. Consulta o histórico de descartes cadastrados.
6. Acessa dicas educativas sobre descarte correto.
7. Consulta pontos de coleta disponíveis.
8. Encerra a sessão usando a opção de sair.

Resultado esperado:

- O cidadão consegue registrar e consultar descartes no próprio dispositivo.
- O histórico fica salvo localmente com AsyncStorage.

## Empresa/Catador

Credencial de teste:

```text
E-mail: lucas@gmail.com
Senha: 1234
```

Jornada:

1. Abre o app EcoSmart Empresa/Catador.
2. Entra com a credencial de teste ou cria um cadastro local simples.
3. Visualiza descartes disponíveis para coleta.
4. Filtra os descartes por tipo de resíduo.
5. Abre os detalhes de um descarte.
6. Marca o descarte como coletado.
7. Consulta a lista de coletas realizadas.
8. Encerra a sessão usando a opção de sair.

Resultado esperado:

- O coletor consegue acompanhar oportunidades de coleta.
- O fluxo permite diferenciar descartes disponíveis e descartes já coletados.

## Administrador

Credencial de teste:

```text
E-mail: joao@gmail.com
Senha: 1234
```

Jornada:

1. Abre o app EcoSmart Admin.
2. Entra com a credencial de teste ou cria um cadastro local simples.
3. Acessa o painel administrativo.
4. Cadastra e gerencia tipos de resíduos.
5. Cadastra e gerencia pontos de coleta.
6. Cadastra e gerencia dicas educativas.
7. Visualiza registros gerais de descartes.
8. Filtra registros por status.
9. Encerra a sessão usando a opção de sair.

Resultado esperado:

- O administrador consegue manter as informações principais do ecossistema.
- O painel oferece uma visão geral dos registros pendentes, visualizados e coletados.
