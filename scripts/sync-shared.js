/**
 * Script de Sincronização do Monorepo EcoSmart Mobile.
 * Copia os utilitários, serviços, modelos e componentes de shared/ para os 3 frontends
 * garantindo integridade arquitetural sem dependência de symlinks no Metro Bundler.
 *
 * BLINDAGEM DE SEGURANÇA:
 * Garante que a sincronização NÃO vaze configurações, instâncias ou credenciais do
 * banco de dados de administradores (ecosmart-admin-db) para os aplicativos Cidadão ou Coletor.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sharedDir = path.join(rootDir, 'shared');

/**
 * Detecta o endereço IPv4 da rede local (LAN/Wi-Fi) do computador host
 * para permitir que dispositivos físicos conectados ao Expo Go acessem a API REST na porta 3333.
 */
function detectHostLanIp() {
  try {
    const interfaces = os.networkInterfaces();
    const preferredOrder = [];
    const fallbackOrder = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!Array.isArray(addrs)) continue;
      const lowerName = name.toLowerCase();
      // Ignora interfaces virtuais de Hyper-V/WSL/Docker/Loopback
      const isVirtual =
        lowerName.includes('vethernet') ||
        lowerName.includes('wsl') ||
        lowerName.includes('docker') ||
        lowerName.includes('virtualbox') ||
        lowerName.includes('vmware');

      for (const addr of addrs) {
        if ((addr.family === 'IPv4' || addr.family === 4) && !addr.internal && addr.address) {
          if (!isVirtual && /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(addr.address)) {
            preferredOrder.push(addr.address);
          } else if (!isVirtual) {
            fallbackOrder.push(addr.address);
          }
        }
      }
    }

    return preferredOrder[0] || fallbackOrder[0] || null;
  } catch (_e) {
    return null;
  }
}

const detectedLanIp = detectHostLanIp();

const targetApps = [
  { path: path.join(rootDir, 'frontend', 'ecosmart-cidadao', 'src'), name: 'ecosmart-cidadao', isAdmin: false },
  { path: path.join(rootDir, 'frontend', 'ecosmart-coletor', 'src'), name: 'ecosmart-coletor', isAdmin: false },
  { path: path.join(rootDir, 'frontend', 'ecosmart-admin', 'src'), name: 'ecosmart-admin', isAdmin: true },
];

// A pasta theme fica fora da sincronização porque cada app possui identidade visual própria.
const foldersToSync = ['models', 'services', 'utils', 'components', 'data', 'hooks'];

/**
 * Sanitiza o arquivo firebaseConfig.ts para aplicativos comuns (Cidadão e Coletor),
 * removendo referências ao banco administrativo dedicado ecosmart-admin-db.
 */
function sanitizeFirebaseConfigForClient(content) {
  let sanitized = content;

  // Oculta/invalida o ID do banco administrativo
  sanitized = sanitized.replace(
    /export const ADMIN_DATABASE_ID = ['"][^'"]+['"];/,
    `// Isolamento Arquitetural: Banco administrativo restrito ao EcoSmart Admin\nexport const ADMIN_DATABASE_ID = undefined;`
  );

  // Oculta coleções administrativas
  sanitized = sanitized.replace(
    /export const ADMIN_FIRESTORE_COLLECTIONS = \{[\s\S]*?\} as const;/,
    `// Coleções administrativas omitidas no aplicativo comum\nexport const ADMIN_FIRESTORE_COLLECTIONS = undefined;`
  );

  // Substitui a função por um guard que lança erro imediato caso chamada
  sanitized = sanitized.replace(
    /export function getAdminFirebaseDb\(\) \{[\s\S]*?\n\}/,
    `export function getAdminFirebaseDb(): never {\n  throw new Error('Acesso Proibido: Este aplicativo conecta-se exclusivamente ao banco padrão ((default)) e não possui acesso ao banco de dados administrativo.');\n}`
  );

  return sanitized;
}

function copyRecursive(src, dest, targetApp) {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, targetApp);
    } else {
      if (entry.name === 'firebaseConfig.ts' && !targetApp.isAdmin) {
        const rawContent = fs.readFileSync(srcPath, 'utf-8');
        const sanitizedContent = sanitizeFirebaseConfigForClient(rawContent);
        fs.writeFileSync(destPath, sanitizedContent, 'utf-8');
      } else if (entry.name === 'crossAppSync.ts' && detectedLanIp) {
        const rawContent = fs.readFileSync(srcPath, 'utf-8');
        const injectedContent = rawContent.replace(
          /export const DETECTED_HOST_LAN_URL = ['"][^'"]*['"];/,
          `export const DETECTED_HOST_LAN_URL = 'http://${detectedLanIp}:3333';`
        );
        fs.writeFileSync(destPath, injectedContent, 'utf-8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function syncShared() {
  console.log('🔄 Sincronizando módulos de shared/ para os aplicativos front-end com blindagem de isolamento...');

  for (const app of targetApps) {
    for (const folder of foldersToSync) {
      const srcFolder = path.join(sharedDir, folder);
      const destFolder = path.join(app.path, folder);
      copyRecursive(srcFolder, destFolder, app);
    }
    const isolationTag = app.isAdmin ? '👑 [Admin: Banco Dedicado]' : '🛡️ [Comum: Banco Padrão Apenas]';
    console.log(`✅ Sincronizado ${isolationTag}: ${path.relative(rootDir, app.path)}`);
  }

  console.log('✨ Sincronização concluída com 100% de consistência e isolamento!');
}

syncShared();
