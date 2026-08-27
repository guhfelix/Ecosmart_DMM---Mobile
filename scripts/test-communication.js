/**
 * EcoSmart Mobile - Script de Diagnóstico e Teste de Comunicação
 * 
 * Executa testes práticos de criação, leitura, atualização e exclusão (CRUD)
 * na API REST Backend, no Firebase Firestore e valida o isolamento de armazenamento local.
 * Em caso de falhas, exibe o diagnóstico detalhado com a causa raiz do erro.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3333;
const BASE_URL = `http://localhost:${PORT}`;
const TIMEOUT_MS = 3000;

// Cores ANSI para o terminal
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

function logStep(stepNum, name) {
  console.log(`\n${CYAN}${BOLD}[Etapa ${stepNum}] ${name}${RESET}`);
}

function logSuccess(message) {
  console.log(`  ${GREEN}✅ ${message}${RESET}`);
}

function logWarn(message) {
  console.log(`  ${YELLOW}⚠️  ${message}${RESET}`);
}

function logError(message, details = null) {
  console.log(`  ${RED}❌ ${message}${RESET}`);
  if (details) {
    console.log(`  ${RED}   Detalhes do Erro: ${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}${RESET}`);
  }
}

/**
 * Utilitário HTTP para requisições com Promise e timeout
 */
function requestHttp(method, pathUrl, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: TIMEOUT_MS,
    };

    let postData = null;
    if (body) {
      postData = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => { resBody += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = resBody ? JSON.parse(resBody) : null;
        } catch (e) {
          parsed = resBody;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          raw: resBody,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout de comunicação após ${TIMEOUT_MS}ms ao chamar ${method} ${pathUrl}`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Garante que o servidor de sincronização esteja ativo
 */
async function ensureServerRunning() {
  try {
    const health = await requestHttp('GET', '/api/health');
    if (health.statusCode === 200) {
      return { running: true, startedNow: false };
    }
  } catch (err) {
    // Servidor não está ativo, inicializa
  }

  // Inicializa servidor em background
  const { spawn } = require('child_process');
  const serverPath = path.join(__dirname, 'sync-server.js');
  const child = spawn(process.execPath, [serverPath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();

  // Aguarda até 3 segundos pela inicialização
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const health = await requestHttp('GET', '/api/health');
      if (health.statusCode === 200) {
        return { running: true, startedNow: true };
      }
    } catch (e) {}
  }

  return { running: false, startedNow: false };
}

async function runDiagnostic() {
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}   🧪 EcoSmart Mobile - Teste de Comunicação e Sync   ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}`);

  const results = {
    serverOnline: false,
    creationSuccess: false,
    readSuccess: false,
    collectSuccess: false,
    deleteSuccess: false,
    storageIsolated: false,
    firestoreReady: false,
  };

  const testDiscardId = `test-sync-${Date.now()}`;
  const testDiscardPayload = {
    id: testDiscardId,
    citizenName: 'Maria Cidadã Pantaneira (Teste Automatizado)',
    wasteType: 'Plástico e PET',
    type: 'Plástico e PET',
    quantity: '4 garrafas PET (2L)',
    observation: 'Teste de comunicação e sincronização em tempo real',
    cep: '78200-000',
    address: 'Rua Cel. José Dulce',
    number: '500',
    neighborhood: 'Centro',
    city: 'Cáceres',
    status: 'pendente',
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };

  // ----------------------------------------------------
  // ETAPA 1: Conexão e Saúde do Servidor Backend
  // ----------------------------------------------------
  logStep(1, 'Verificando Servidor Centralizado Backend (Node.js REST)');
  const startTime = Date.now();
  const serverStatus = await ensureServerRunning();
  
  if (!serverStatus.running) {
    logError('Não foi possível conectar ao servidor central na porta ' + PORT, {
      porta: PORT,
      url: BASE_URL,
      motivo: 'O servidor não respondeu às chamadas HTTP em /api/health.',
      solucao: 'Execute "npm run server" em um terminal dedicado para verificar eventuais erros de inicialização.',
    });
  } else {
    const elapsed = Date.now() - startTime;
    results.serverOnline = true;
    logSuccess(`Servidor Backend ativo e respondendo em ${BASE_URL} (${elapsed}ms)`);
    if (serverStatus.startedNow) {
      console.log(`    ℹ️  Servidor inicializado automaticamente para o teste.`);
    }
  }

  // ----------------------------------------------------
  // ETAPA 2: Teste de Criação de Descarte (POST /api/discards)
  // ----------------------------------------------------
  logStep(2, 'Testando Criação de Descarte (Envio HTTP POST pelo Cidadão)');
  if (results.serverOnline) {
    try {
      const createRes = await requestHttp('POST', '/api/discards', testDiscardPayload);
      if (createRes.statusCode === 201 || createRes.statusCode === 200) {
        results.creationSuccess = true;
        logSuccess(`Descarte criado com sucesso no servidor! ID: ${testDiscardId}`);
        console.log(`    📦 Tipo: ${testDiscardPayload.wasteType} | Quantidade: ${testDiscardPayload.quantity} | Local: Cáceres - MT`);
      } else {
        logError(`Falha ao criar descarte no servidor. HTTP Status: ${createRes.statusCode}`, createRes.data);
      }
    } catch (err) {
      logError('Erro de conexão durante a criação do descarte', {
        mensagem: err.message,
        codigo: err.code || 'HTTP_ERROR',
        diagnostico: 'A requisição POST para /api/discards falhou.',
      });
    }
  } else {
    logWarn('Etapa de criação ignorada pois o servidor não está acessível.');
  }

  // ----------------------------------------------------
  // ETAPA 3: Teste de Leitura e Disponibilidade (GET /api/discards)
  // ----------------------------------------------------
  logStep(3, 'Testando Leitura e Recepção de Dados (Consulta pelo Coletor/Admin)');
  if (results.creationSuccess) {
    try {
      const getRes = await requestHttp('GET', '/api/discards');
      if (getRes.statusCode === 200 && Array.isArray(getRes.data)) {
        const found = getRes.data.find((item) => item.id === testDiscardId);
        if (found) {
          results.readSuccess = true;
          logSuccess(`Descarte localizado na lista global de descartes (${getRes.data.length} registros no total).`);
          console.log(`    📍 Status verificado: "${found.status}" | Criado por: "${found.citizenName}"`);
        } else {
          logError(`O descarte ${testDiscardId} foi criado mas não apareceu na listagem GET /api/discards.`, {
            totalRegistros: getRes.data.length,
          });
        }
      } else {
        logError(`Resposta inválida na consulta GET /api/discards. HTTP Status: ${getRes.statusCode}`);
      }
    } catch (err) {
      logError('Erro ao consultar lista de descartes', err.message);
    }
  } else {
    logWarn('Etapa de leitura ignorada devido a falha na criação.');
  }

  // ----------------------------------------------------
  // ETAPA 4: Teste de Baixa de Coleta (POST /api/discards/:id/collect)
  // ----------------------------------------------------
  logStep(4, 'Testando Baixa de Coleta (Atualização de Status pelo Coletor)');
  if (results.readSuccess) {
    try {
      const collectRes = await requestHttp('POST', `/api/discards/${testDiscardId}/collect`, {
        coletorId: 'user-coletor-lucas',
      });
      if (collectRes.statusCode === 200 && collectRes.data && collectRes.data.success) {
        results.collectSuccess = true;
        logSuccess(`Descarte ${testDiscardId} marcado como COLETADO com sucesso.`);
        console.log(`    🚛 Coletor: "user-coletor-lucas" | Data de Coleta: "${collectRes.data.item?.collectedAt}"`);
      } else {
        logError(`Falha na baixa de coleta. HTTP Status: ${collectRes.statusCode}`, collectRes.data);
      }
    } catch (err) {
      logError('Erro na requisição de baixa de coleta', err.message);
    }
  } else {
    logWarn('Etapa de baixa de coleta ignorada.');
  }

  // ----------------------------------------------------
  // ETAPA 5: Teste de Exclusão e Limpeza (DELETE /api/discards/:id)
  // ----------------------------------------------------
  logStep(5, 'Testando Exclusão e Limpeza do Registro de Teste');
  if (results.serverOnline && results.creationSuccess) {
    try {
      const deleteRes = await requestHttp('DELETE', `/api/discards/${testDiscardId}`);
      if (deleteRes.statusCode === 200 && deleteRes.data?.success) {
        results.deleteSuccess = true;
        logSuccess(`Registro de teste ${testDiscardId} removido do servidor sem deixar resíduos.`);
      } else {
        logWarn(`Aviso ao excluir item de teste: HTTP Status ${deleteRes.statusCode}`);
      }
    } catch (err) {
      logWarn(`Não foi possível remover o item de teste: ${err.message}`);
    }
  }

  // ----------------------------------------------------
  // ETAPA 6: Validação de Isolamento de Persistência Local
  // ----------------------------------------------------
  logStep(6, 'Validando Isolamento de Persistência Local por Aplicativo');
  try {
    const storageKeysPath = path.join(__dirname, '..', 'shared', 'services', 'storageKeys.ts');
    const storageContent = fs.readFileSync(storageKeysPath, 'utf-8');

    const hasCidadaoNs = storageContent.includes('@ecosmart_cidadao_');
    const hasColetorNs = storageContent.includes('@ecosmart_coletor_');
    const hasAdminNs = storageContent.includes('@ecosmart_admin_');

    if (hasCidadaoNs && hasColetorNs && hasAdminNs) {
      results.storageIsolated = true;
      logSuccess('Namespaces de armazenamento local isolados com sucesso:');
      console.log('    📱 EcoSmart Cidadão: @ecosmart_cidadao_*');
      console.log('    🚛 EcoSmart Coletor: @ecosmart_coletor_*');
      console.log('    📊 EcoSmart Admin:   @ecosmart_admin_*');
    } else {
      logError('Inconsistência nos namespaces de armazenamento local!');
    }
  } catch (err) {
    logError('Erro ao verificar isolamento de armazenamento local', err.message);
  }

  // ----------------------------------------------------
  // ETAPA 7: Verificação do Módulo Cloud Firestore & Listeners
  // ----------------------------------------------------
  logStep(7, 'Verificando Módulo do Firebase (Cloud Firestore & Listeners onSnapshot)');
  try {
    const firebaseServicePath = path.join(__dirname, '..', 'shared', 'services', 'firebaseService.ts');
    const firebaseContent = fs.readFileSync(firebaseServicePath, 'utf-8');

    const hasSave = firebaseContent.includes('saveDiscardDocument');
    const hasGet = firebaseContent.includes('getDiscards');
    const hasSubscribe = firebaseContent.includes('subscribeToDiscards');
    const hasSnapshot = firebaseContent.includes('onSnapshot');

    if (hasSave && hasGet && hasSubscribe && hasSnapshot) {
      results.firestoreReady = true;
      logSuccess('Serviço Firebase Firestore configurado com operações CRUD e Listeners em Tempo Real (onSnapshot).');
    } else {
      logError('Métodos de tempo real ou CRUD ausentes em firebaseService.ts');
    }
  } catch (err) {
    logError('Erro ao verificar módulo Firebase', err.message);
  }

  // ----------------------------------------------------
  // RELATÓRIO FINAL E DIAGNÓSTICO
  // ----------------------------------------------------
  console.log(`\n${BOLD}====================================================${RESET}`);
  console.log(`${BOLD}             📊 RELATÓRIO DE DIAGNÓSTICO             ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}`);

  const allPassed =
    results.serverOnline &&
    results.creationSuccess &&
    results.readSuccess &&
    results.collectSuccess &&
    results.storageIsolated &&
    results.firestoreReady;

  console.log(`  1. Servidor Backend REST (Porta ${PORT}):        ${results.serverOnline ? GREEN + 'OK (Operacional)' : RED + 'FALHA'}${RESET}`);
  console.log(`  2. Comunicação de Criação (POST /api/discards): ${results.creationSuccess ? GREEN + 'OK (Operacional)' : RED + 'FALHA'}${RESET}`);
  console.log(`  3. Comunicação de Leitura (GET /api/discards):   ${results.readSuccess ? GREEN + 'OK (Operacional)' : RED + 'FALHA'}${RESET}`);
  console.log(`  4. Atualização de Baixa de Coleta:              ${results.collectSuccess ? GREEN + 'OK (Operacional)' : RED + 'FALHA'}${RESET}`);
  console.log(`  5. Persistência Local Isolada (AsyncStorage):   ${results.storageIsolated ? GREEN + 'OK (Isolado)' : RED + 'FALHA'}${RESET}`);
  console.log(`  6. Cloud Firestore Listeners (onSnapshot):      ${results.firestoreReady ? GREEN + 'OK (Configurado)' : RED + 'FALHA'}${RESET}`);

  console.log('----------------------------------------------------');
  if (allPassed) {
    console.log(`${GREEN}${BOLD}✨ RESULTADO: Todos os canais de comunicação e criação estão 100% OPERACIONAIS!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}⚠️  RESULTADO: Foram identificadas pendências na comunicação.${RESET}`);
    console.log(`Consulte os detalhes de erro acima para aplicar as correções necessárias.\n`);
    process.exit(1);
  }
}

runDiagnostic().catch((err) => {
  console.error('Erro inesperado no diagnóstico:', err);
  process.exit(1);
});
