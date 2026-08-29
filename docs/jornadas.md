# Jornadas do Usuário - EcoSmart Mobile

Este documento descreve as jornadas do usuário nos três aplicativos do ecossistema **EcoSmart Mobile**, detalhando o fluxo de navegação, ações principais e regras operacionais.

---

## 🌱 1. Jornada do Cidadão (EcoSmart Cidadão)

**Credencial de Teste:** `maria@gmail.com` / `1234` | **Login Google:** Suportado (`maria.google@gmail.com`)

### Fluxo de Uso:
1. **Autenticação com Google ou E-mail:** O cidadão pode entrar rapidamente clicando em *"Continuar com o Google"* ou usando seu e-mail e senha. Se esquecer a senha, clica em *"Esqueci minha senha"* e recebe o código de verificação (`ECO-XXXX`) para redefinição imediata.
2. **Registro de Descarte com CEP/GPS e Foto:**
   - Clica em *"Registrar descarte"*.
   - Seleciona o material (Plástico, Papelão, Vidro, Metal, Eletrônicos, Óleo, etc.) e informa a quantidade em volumes.
   - Digita o CEP para autopreencher a rua e o bairro em Cáceres - MT (ViaCEP) ou clica em *"📍 Usar minha localização atual (GPS)"*.
   - Anexa uma foto da câmera ou seleciona uma amostra representativa.
   - Salva o descarte: se estiver sem internet, o app salva localmente como `Pendente (Offline)` e o banner avisa que a sincronização ocorrerá automaticamente ao reconectar.
   - O descarte é salvo no Cloud Firestore (`saveCitizenDiscard`), transmitido no barramento (0ms) e enviado ao backend central.
3. **Consulta de Histórico, Detalhes e Exclusão:**
   - Acessa a tela de histórico e filtra por status (*Todos*, *Pendentes*, *Coletados*) ou busca por material/endereço.
   - Toca no descarte para abrir a tela **Detalhes do Descarte**, onde pode inspecionar os dados ou cancelar/excluir a solicitação.
4. **Consulta de Ecopontos (PEVs) & Navegação GPS:** Acessa a lista de pontos de entrega voluntária de Cáceres com cálculo de distância em km (Haversine) e aciona *"🗺️ Traçar Rota GPS"* (Google Maps / Waze).
5. **Dicas de Sustentabilidade:** Lê recomendações práticas sobre separação correta de resíduos e conservação do Pantanal.
6. **Central de Notificações:** Clica no sino 🔔 para ver avisos em tempo real quando suas coletas forem concluídas pelo coletor.
7. **Perfil do Cidadão:** Acessa seu perfil para consultar o resumo de descartes e editar seus dados cadastrais (telefone, endereço padrão e biografia).

---

## 🚛 2. Jornada da Empresa/Catador (EcoSmart Empresa/Catador)

**Credencial de Teste:** `lucas@gmail.com` / `1234` | **Login Google:** Suportado (`lucas.google@gmail.com`)

### Fluxo de Uso:
1. **Autenticação Segura (Google / E-mail com RBAC):** Entra com seu perfil de coletor via Google ou e-mail/senha. Tentativas de acesso com contas de cidadão ou administrador são bloqueadas com alertas explicativos.
2. **Menu Inicial Objetivo:** Visualiza imediatamente os totalizadores de novos descartes disponíveis, coletas concluídas e atalho para o perfil operacional.
3. **Feed de Descartes com Ações em 1 Toque:**
   - Acessa a lista de descartes pendentes em Cáceres - MT.
   - Os resíduos são automaticamente ordenados por proximidade geográfica (distância de Haversine via GPS).
   - Utiliza filtros por material ou pesquisa por bairro.
   - **Ação em 1 Toque no Card:** Toca em *"🗺️ Rota GPS"* para abrir o trajeto no Google Maps/Waze ou em *"✅ Coletar"* para confirmar o recolhimento sem precisar trocar de tela.
4. **Inspeção de Detalhes:** Opcionalmente, clica no card para abrir a tela de detalhes com foto ampliada, observações do cidadão e endereço.
5. **Confirmação e Baixa de Coleta:**
   - Ao confirmar a coleta, o status é atualizado para `coletado` e propagado imediatamente para o Cidadão e para o Admin via barramento 0ms.
   - Se estiver sem sinal de internet, a coleta é registrada com `offlineSyncPending: true` e sincronizada ao restabelecer a conexão.
6. **Histórico de Coletas Realizadas:** Consulta a relação de todos os recolhimentos efetuados com data e busca textual.
7. **Perfil Operacional & Logística:** Acompanha o resumo operacional de coletas e atualiza dados do veículo (caminhonete, triciclo), capacidade de carga e bairros atendidos.

---

## 🛡️ 3. Jornada do Administrador (EcoSmart Admin)

**Credencial de Teste:** `joao@gmail.com` / `1234` | **Login Google:** Suportado (`joao.google@gmail.com`) | **Chave Mestra de Cadastro:** `ADMIN2026`

### Fluxo de Uso:
1. **Autenticação Administrativa:** Entra com login do Google ou e-mail/senha. Para cadastrar um novo gestor, o sistema exige a Chave Mestre `ADMIN2026`.
2. **Painel Executivo:** Acompanha os contadores em tempo real de tipos de resíduos, pontos de coleta, dicas cadastradas, descartes pendentes e coletas concluídas.
3. **Gestão de Catálogo (CRUDs Completos):**
   - Cria, edita e exclui tipos de materiais recicláveis aceitos na plataforma.
   - Mantém os Ecopontos e PEVs municipais com endereço, horários de funcionamento e coordenadas geográficas (Latitude/Longitude).
   - Publica e edita dicas educativas de sustentabilidade para os cidadãos.
4. **Auditoria de Registros & Exclusão:** Monitora a listagem unificada de todos os descartes do município com filtros de status e busca em tempo real, podendo excluir registros inconsistentes.
5. **Emissão de Relatórios ESG & Exportação em CSV:**
   - Clica em *"Exportar Relatório ESG (CSV)"*.
   - O sistema calcula automaticamente a Taxa de Reciclagem (%), kg de CO₂ evitado e litros de água economizados.
   - Gera o arquivo CSV delimitado por ponto-e-vírgula (`;`) com Resumo Executivo ESG pronto para apresentação institucional e prestação de contas.
6. **Perfil de Gestão e Governança:** Edita informações do administrador (cargo, departamento e declaração de governança ESG) e monitora a integridade do ecossistema.
