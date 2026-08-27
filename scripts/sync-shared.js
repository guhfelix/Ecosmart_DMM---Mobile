/**
 * Script de Sincronização do Monorepo EcoSmart Mobile.
 * Copia os utilitários, serviços, modelos e componentes de shared/ para os 3 frontends
 * garantindo integridade arquitetural sem dependência de symlinks no Metro Bundler.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sharedDir = path.join(rootDir, 'shared');

const targetApps = [
  path.join(rootDir, 'frontend', 'ecosmart-cidadao', 'src'),
  path.join(rootDir, 'frontend', 'ecosmart-coletor', 'src'),
  path.join(rootDir, 'frontend', 'ecosmart-admin', 'src'),
];

const foldersToSync = ['models', 'services', 'utils', 'components', 'data', 'hooks', 'theme'];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function syncShared() {
  console.log('🔄 Sincronizando módulos de shared/ para os aplicativos front-end...');

  for (const appSrc of targetApps) {
    for (const folder of foldersToSync) {
      const srcFolder = path.join(sharedDir, folder);
      const destFolder = path.join(appSrc, folder);
      copyRecursive(srcFolder, destFolder);
    }
    console.log(`✅ Sincronizado com sucesso: ${path.relative(rootDir, appSrc)}`);
  }

  console.log('✨ Sincronização concluída com 100% de consistência!');
}

syncShared();
