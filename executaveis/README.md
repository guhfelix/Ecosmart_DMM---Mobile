# 🚀 Executáveis e Scripts de Automação - EcoSmart Mobile

Esta pasta contém scripts executáveis com duplo clique (.bat) no Windows para facilitar a instalação de dependências, execução de testes automatizados, diagnóstico de comunicação e inicialização dos 3 aplicativos do monorepo.

> **Nota:** Os scripts de inicialização dos aplicativos realizam automaticamente a sincronização dos módulos compartilhados (`shared/`), inicializam o **Servidor Central Backend (Porta 3333)** em segundo plano e conectam com o **Firebase Cloud Firestore & Auth**.

---

## 📂 Lista de Executáveis

| Arquivo | Função | Como Usar |
| :--- | :--- | :--- |
| **`MENU-ECOSMART.bat`** | **Painel Principal Interativo:** Menu completo para controlar todos os apps, testes, servidor e Firebase. | Duplo clique no Windows |
| **`1-instalar-dependencias.bat`** | Instala as dependências da raiz e de cada um dos 3 aplicativos (`ecosmart-cidadao`, `ecosmart-coletor`, `ecosmart-admin`). | Duplo clique no Windows |
| **`2-executar-testes.bat`** | Executa a sincronização, checagem TypeScript (`tsc --noEmit`), testes Jest (74 suítes, 383 testes) e diagnóstico de comunicação. | Duplo clique no Windows |
| **`3-iniciar-cidadao.bat`** | Sincroniza, inicia o servidor backend + Firebase e abre o **EcoSmart Cidadão** na porta `8081`. | Duplo clique no Windows |
| **`4-iniciar-coletor.bat`** | Sincroniza, inicia o servidor backend + Firebase e abre o **EcoSmart Coletor** na porta `8082`. | Duplo clique no Windows |
| **`5-iniciar-admin.bat`** | Sincroniza, inicia o servidor backend + Firebase e abre o **EcoSmart Admin** na porta `8083`. | Duplo clique no Windows |
| **`6-sincronizar-modulos.bat`** | Propaga imediatamente os modelos, utilitários, temas e serviços de `shared/` para todos os 3 aplicativos. | Duplo clique no Windows |
| **`7-testar-comunicacao.bat`** | Executa teste prático de criação, leitura, atualização e exclusão na API REST Backend e Firebase. | Duplo clique no Windows |
| **`8-iniciar-servidor.bat`** | Inicia exclusivamente o Servidor Central Backend (Node.js REST) na porta `3333`. | Duplo clique no Windows |

---

## 📱 Portas dos Serviços e Aplicativos:
- **Servidor Central Backend (Node.js REST):** `http://localhost:3333`
- **EcoSmart Cidadão:** `http://localhost:8081`
- **EcoSmart Coletor:** `http://localhost:8082`
- **EcoSmart Admin:** `http://localhost:8083`
- **Firebase Cloud Firestore:** Projeto `ecosmart-mobile`

