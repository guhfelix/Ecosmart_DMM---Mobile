# Jornadas do Usuário - EcoSmart Mobile

Este documento descreve as jornadas do usuário nos três aplicativos do ecossistema **EcoSmart Mobile**.

---

## 🌱 1. Jornada do Cidadão (EcoSmart Cidadão)

**Credencial de Teste:** `maria@gmail.com` / `1234` | **Login Google:** Suportado (`maria.google@gmail.com`)

### Fluxo de Uso:
1. **Autenticação com Google ou E-mail:** O cidadão pode entrar rapidamente clicando em *"Continuar com o Google"* ou usando seu e-mail e senha. Se esquecer a senha, clica em *"Esqueci minha senha"* e recebe o código de verificação (`ECO-XXXX`) para redefinição imediata.
2. **Registro de Descarte com GPS e Foto:**
   - Clica em *"Registrar descarte"*.
   - Seleciona o material (Plástico, Papel, Vidro, Metal, etc.) e a quantidade.
   - Clica em *"📍 Usar minha localização atual (GPS)"* para autopreencher as coordenadas e endereço.
   - Anexa uma foto da câmera ou seleciona uma amostra representativa da galeria.
   - Salva o descarte (se estiver sem internet, o app salva localmente como `Pendente (Offline)` e o banner avisa que a sincronização ocorrerá automaticamente ao reconectar).
3. **Consulta de Pontos & Navegação GPS:** Acessa a lista de ecopontos com cálculo de distância (em km) e aciona *"🗺️ Traçar Rota GPS"*.
4. **Central de Notificações:** Clica no sino 🔔 para ver avisos em tempo real quando suas coletas forem concluídas.
5. **Perfil do Cidadão (Meu Perfil):** Acessa a tela de perfil para consultar seu resumo de descartes (total, coletados e pendentes) e editar seus dados cadastrais (telefone, endereço padrão e biografia).

---

## 🚛 2. Jornada da Empresa/Catador (EcoSmart Empresa/Catador)

**Credencial de Teste:** `lucas@gmail.com` / `1234` | **Login Google:** Suportado (`lucas.google@gmail.com`)

### Fluxo de Uso:
1. **Autenticação Segura (Google / E-mail com RBAC):** Entra com seu perfil de coletor via Google ou credenciais de e-mail/senha. Tentativas com contas de cidadão ou admin são bloqueadas com alertas instrutivos.
2. **Busca e Triagem de Descartes por Proximidade:**
   - Acessa a lista de descartes disponíveis.
   - Utiliza a busca em tempo real por bairro ou tipo de material.
   - Seleciona a ordenação por *"Mais próximos (GPS)"* baseada no cálculo de Haversine.
   - Visualiza a miniatura da foto do resíduo diretamente no card.
3. **Inspeção de Detalhes e Rota:** Abre a tela de detalhes para visualizar a foto ampliada, dados do cidadão e clica em *"🗺️ Iniciar Navegação GPS"* para traçar o melhor trajeto.
4. **Confirmação de Coleta:**
   - Clica em *"Marcar como coletado"*.
   - Se estiver em área sem sinal, a coleta é registrada com a flag `offlineSyncPending` e sincroniza ao restabelecer conexão.
5. **Perfil Operacional & Logística:** Acessa o perfil para acompanhar o resumo operacional de coletas realizadas, descartes disponíveis na região e editar seu veículo de coleta e capacidade de carga.

---

## 🛡️ 3. Jornada do Administrador (EcoSmart Admin)

**Credencial de Teste:** `joao@gmail.com` / `1234` | **Login Google:** Suportado (`joao.google@gmail.com`) | **Chave Mestra de Cadastro:** `ADMIN2026`

### Fluxo de Uso:
1. **Autenticação Administrativa:** Entra com login do Google ou credenciais de e-mail. Para cadastrar um novo administrador, o sistema exige obrigatoriamente o código de segurança `ADMIN2026`.
2. **Gestão de Catálogo (CRUDs com Busca):**
   - Cria, edita e exclui tipos de resíduos aceitos.
   - Mantém os pontos de coleta com endereço, horários e coordenadas geográficas.
   - Publica dicas educativas sobre sustentabilidade.
3. **Painel de Registros Gerais & Filtros:** Acompanha o funil de status (*Pendentes*, *Visualizados*, *Coletados*) com contadores dinâmicos.
4. **Emissão de Relatórios de Sustentabilidade ESG:**
   - Abre o modal *"📊 Relatório ESG & Exportação"*.
   - Analisa indicadores de Taxa de Reciclagem (%), Carbono Evitado (kg CO₂) e Água Preservada (Litros).
   - Exporta os dados tabulares em formato **CSV** pronto para prestação de contas.
5. **Perfil de Gestão Master:** Edita informações do administrador (cargo, departamento e declaração de governança ESG) e monitora a integridade do ecossistema.
