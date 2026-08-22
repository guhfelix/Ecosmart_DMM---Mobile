# Comandos Git

Este arquivo resume os comandos mais usados no projeto EcoSmart Mobile.

## Clonar o repositório

```bash
git clone https://github.com/guhfelix/Ecosmart_DMM---Mobile.git
cd Ecosmart_DMM---Mobile
```

## Verificar alterações

```bash
git status
git status --short
```

Para ver um resumo dos arquivos alterados:

```bash
git diff --stat
```

## Criar um commit

```bash
git add .
git commit -m "Descreva aqui a alteração feita"
```

Exemplos de commits já usados no projeto:

```bash
git commit -m "Padroniza apps no Expo SDK 54"
git commit -m "Implementa MVP do app Coletor"
git commit -m "Implementa MVP do app Admin"
git commit -m "Adiciona login e cadastro nos tres apps"
```

## Enviar para o GitHub

```bash
git push origin main
```

## Consultar histórico

```bash
git log --oneline
```

## Fluxo recomendado

```bash
git status --short
git diff --stat
git add .
git commit -m "Mensagem objetiva explicando a entrega"
git push origin main
```
