# Comandos Git e Fluxo de Desenvolvimento - EcoSmart Mobile

Este documento resume os comandos Git e scripts de validação mais utilizados no ecossistema **EcoSmart Mobile**.

---

## 📥 1. Clonar o Repositório

```bash
git clone https://github.com/guhfelix/Ecosmart_DMM---Mobile.git
cd Ecosmart_DMM---Mobile
```

---

## 🔍 2. Verificar Alterações

```bash
# Status dos arquivos modificados
git status

# Status resumido
git status --short

# Ver resumo dos arquivos e linhas alteradas
git diff --stat

# Ver alterações detalhadas
git diff
```

---

## 🧪 3. Validações Obrigatórias Antes do Commit

Antes de criar um commit, execute os scripts de verificação para garantir que o monorepo está integro:

```bash
# 1. Sincronizar código compartilhado com os frontends
npm run sync:shared

# 2. Executar verificação estática de tipos TypeScript (deve retornar 0 erros)
npm run typecheck:all

# 3. Executar toda a suíte de testes automatizados (75 suítes e 386 testes)
npm run test:all

# 4. Executar diagnóstico de comunicação com a API e Firebase
npm run test:communication
```

---

## 💾 4. Criar um Commit

```bash
# Adicionar todos os arquivos alterados
git add .

# Criar commit com mensagem descritiva
git commit -m "feat(cidadao): adiciona tela de detalhes de descarte com exclusao em tempo real"
```

### Exemplos de Mensagens de Commit Padronizadas:
```bash
git commit -m "docs: sincroniza documentacao oficial com codigo-fonte e regras de negocio"
git commit -m "fix(firebase): corrige mapeamento de bairro no cache local de descartes"
git commit -m "feat(coletor): adiciona acoes em 1 toque no card para rotas GPS e coleta"
git commit -m "feat(admin): implementa exportacao de relatorios ESG em formato CSV"
```

---

## 🚀 5. Enviar para o GitHub

```bash
# Enviar commits para a branch principal
git push origin main
```

---

## 📜 6. Consultar Histórico

```bash
# Ver histórico resumido em linha única
git log --oneline -n 10

# Ver histórico com gráfico de ramificações
git log --graph --oneline --all
```

---

## 🔄 7. Fluxo Recomendado de Trabalho

```bash
# 1. Verificar alterações locais
git status --short

# 2. Validar tipos e testes
npm run test:all
npm run typecheck:all

# 3. Adicionar arquivos e commitar
git add .
git commit -m "tipo(escopo): descricao clara da entrega"

# 4. Enviar para o repositório remoto
git push origin main
```
