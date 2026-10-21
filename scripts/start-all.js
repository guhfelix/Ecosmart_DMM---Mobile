const { spawn } = require('child_process');
const path = require('path');

console.log(`
======================================================
🌱 EcoSmart Mobile - Central de Execução Multi-Apps
======================================================
📡 Servidor Central de Sincronização: http://localhost:3333
📱 EcoSmart Cidadão:                 http://localhost:8081
🚛 EcoSmart Empresa/Catador:         http://localhost:8082
🛡️  EcoSmart Administrador:           http://localhost:8083
======================================================
`);

const syncServer = spawn(process.execPath, [path.join(__dirname, 'sync-server.js')], {
  stdio: 'inherit',
});

syncServer.on('error', (err) => {
  console.warn('⚠️ Aviso ao iniciar processo do servidor central:', err.message);
});

process.on('SIGINT', () => {
  if (!syncServer.killed) {
    syncServer.kill('SIGINT');
  }
  process.exit(0);
});
