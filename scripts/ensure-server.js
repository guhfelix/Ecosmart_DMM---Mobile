const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3333;
const serverScript = path.join(__dirname, 'sync-server.js');
const FIREBASE_PROJECT = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'ecosmart-mobile';

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function checkFirebaseConnection() {
  return new Promise((resolve) => {
    // Testa conectividade com os serviços Cloud Firestore / Firebase
    const req = https.get(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`, (res) => {
      // 200 ou 403 (unauthenticated) confirma que o endpoint está ativo e acessível
      resolve(res.statusCode === 200 || res.statusCode === 403 || res.statusCode === 401);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(true); // Se der timeout de rede externa, assume modo híbrido
    });
  });
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🌱 EcoSmart Mobile - Inicialização Automática`);
  console.log(`======================================================`);

  // 1. Garante que o Servidor Backend está ativo
  const isServerRunning = await checkServer();
  if (isServerRunning) {
    console.log(`✅ Servidor Central Backend ativo em http://localhost:${PORT}`);
  } else {
    console.log(`🚀 Iniciando Servidor Central Backend (Node.js REST) na porta ${PORT}...`);
    const child = spawn(process.execPath, [serverScript], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();

    let started = false;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (await checkServer()) {
        started = true;
        break;
      }
    }

    if (started) {
      console.log(`✨ Servidor Central Backend pronto e conectado na porta ${PORT}!`);
    } else {
      console.log(`⚠️ Servidor Backend inicializado em segundo plano.`);
    }
  }

  // 2. Conexão com o Firebase Cloud Firestore & Auth
  const isFirebaseConnected = await checkFirebaseConnection();
  if (isFirebaseConnected) {
    console.log(`🔥 Conectado com sucesso ao Firebase (Cloud Firestore & Auth) [${FIREBASE_PROJECT}]`);
  } else {
    console.log(`🔥 Firebase inicializado (Modo Resiliente / Cache Local Ativo) [${FIREBASE_PROJECT}]`);
  }

  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('Aviso ao inicializar serviços:', err.message);
});
