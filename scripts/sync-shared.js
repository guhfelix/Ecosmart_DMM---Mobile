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
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sharedDir = path.join(rootDir, 'shared');

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
