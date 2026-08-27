const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const DB_DIR = path.join(__dirname, '..', 'database', 'data');
const DB_FILE = path.join(DB_DIR, 'ecosmart-live-db.json');

// Garante que a pasta do banco existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const INITIAL_CACERES_DISCARDS = [];

const INITIAL_CACERES_USERS = [
  {
    id: 'user-admin-1',
    nome: 'João Gestor SEMATUR',
    email: 'joao@gmail.com',
    perfil: 'admin',
    telefone: '(65) 3223-5500',
    cep: '78200-000',
    endereco: 'Rua Cel. José Dulce',
    numero: '500',
    bairro: 'Centro',
    cidade: 'Cáceres - MT',
    cargo: 'Secretário Municipal de Meio Ambiente',
    departamento: 'SEMATUR - Cáceres MT',
    bio: 'Gestão e monitoramento ambiental do município de Cáceres - MT.',
  },
  {
    id: 'user-cidadao-1',
    nome: 'Maria Cidadã Pantaneira',
    email: 'maria@gmail.com',
    perfil: 'cidadao',
    telefone: '(65) 99988-1234',
    cep: '78200-050',
    endereco: 'Rua Cel. Faria',
    numero: '210',
    bairro: 'Centro',
    cidade: 'Cáceres - MT',
    bio: 'Compromissada com a preservação do Pantanal e a reciclagem em Cáceres - MT.',
  },
  {
    id: 'user-coletor-1',
    nome: 'Lucas Coletor COOPERCÁCERES',
    email: 'lucas@gmail.com',
    perfil: 'coletor',
    telefone: '(65) 99654-7890',
    cep: '78205-100',
    endereco: 'Av. Getúlio Vargas',
    numero: '1420',
    bairro: 'Santos Dumont',
    cidade: 'Cáceres - MT',
    veiculo: 'Caminhonete de Coleta Seletiva',
    capacidadeCarga: '1.200 kg',
    bio: 'Coleta seletiva diária em Cáceres e suporte a cooperativas locais.',
  },
];

let dbState = {
  discards: [...INITIAL_CACERES_DISCARDS],
  users: [...INITIAL_CACERES_USERS],
  lastUpdated: new Date().toISOString(),
};

// Carrega dados persistidos do arquivo se existirem
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.discards)) {
      dbState = {
        discards: parsed.discards.length > 0 ? parsed.discards : INITIAL_CACERES_DISCARDS,
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : INITIAL_CACERES_USERS,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('⚠️ Erro ao ler banco local, inicializando com dados padrão:', err);
  }
} else {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
}

function saveDb() {
  dbState.lastUpdated = new Date().toISOString();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
  } catch (err) {
    console.error('⚠️ Erro ao salvar banco local:', err);
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Endpoint de Saúde
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString(), discardsCount: dbState.discards.length }));
    return;
  }

  // --- Rotas de Descartes (/api/discards) ---
  if (pathname === '/api/discards') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dbState.discards));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const item = JSON.parse(body);
          const id = item.id || `disc-${Date.now()}`;
          const isCollected = (item.status || '').toLowerCase() === 'coletado';

          const normalized = {
            id,
            citizenName: item.citizenName || item.nome_cidadao || 'Maria Cidadã Pantaneira',
            wasteType: item.wasteType || item.type || 'Plástico e PET',
            type: item.type || item.wasteType || 'Plástico e PET',
            quantity: item.quantity || '1 volume',
            address: item.address || 'Cáceres - MT',
            number: item.number || item.numero || '',
            numero: item.numero || item.number || '',
            neighborhood: item.neighborhood || 'Centro',
            city: item.city || 'Cáceres',
            cep: item.cep || '78200-000',
            observation: item.observation || '',
            status: isCollected ? 'coletado' : 'pendente',
            createdAt: item.createdAt || item.date || new Date().toLocaleDateString('pt-BR'),
            date: item.date || item.createdAt || new Date().toLocaleDateString('pt-BR'),
            collectedAt: item.collectedAt,
            coletorId: item.coletorId,
            latitude: typeof item.latitude === 'number' ? item.latitude : -16.0725,
            longitude: typeof item.longitude === 'number' ? item.longitude : -57.6798,
            distanceKm: typeof item.distanceKm === 'number' ? item.distanceKm : 0.8,
            photoUri: item.photoUri,
            updatedAt: new Date().toISOString(),
          };

          const existingIndex = dbState.discards.findIndex((d) => d.id === id);
          if (existingIndex >= 0) {
            dbState.discards[existingIndex] = { ...dbState.discards[existingIndex], ...normalized };
          } else {
            dbState.discards.unshift(normalized);
          }

          saveDb();
          console.log(`[EcoSmart Sync] 📦 Descarte salvo: ${id} (${normalized.wasteType}) por ${normalized.citizenName}`);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, item: normalized }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'JSON inválido' }));
        }
      });
      return;
    }
  }

  // --- Rota de Exclusão de Descarte (DELETE /api/discards/:id) ---
  const deleteMatch = pathname.match(/^\/api\/discards\/([^/]+)$/);
  if (deleteMatch && req.method === 'DELETE') {
    const discardId = deleteMatch[1];
    const initialLength = dbState.discards.length;
    dbState.discards = dbState.discards.filter((d) => d.id !== discardId);
    saveDb();
    console.log(`[EcoSmart Sync] 🗑️ Descarte ${discardId} excluído com sucesso`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, id: discardId, deleted: dbState.discards.length < initialLength }));
    return;
  }

  // --- Rota de Baixa de Coleta (/api/discards/:id/collect) ---
  const collectMatch = pathname.match(/^\/api\/discards\/([^/]+)\/collect$/);
  if (collectMatch && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
    const discardId = collectMatch[1];
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let coletorId = 'user-coletor-1';
      try {
        if (body) {
          const parsed = JSON.parse(body);
          if (parsed.coletorId) coletorId = parsed.coletorId;
        }
      } catch (e) {}

      const found = dbState.discards.find((d) => d.id === discardId);
      if (found) {
        found.status = 'coletado';
        found.collectedAt = new Date().toLocaleDateString('pt-BR');
        found.coletorId = coletorId;
        found.updatedAt = new Date().toISOString();
        saveDb();
        console.log(`[EcoSmart Sync] 🚛 Descarte ${discardId} marcado como COLETADO por ${coletorId}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, item: found }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Descarte não encontrado' }));
      }
    });
    return;
  }

  // --- Rotas de Usuários (/api/users) ---
  if (pathname === '/api/users') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dbState.users));
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const user = JSON.parse(body);
          const existingIndex = dbState.users.findIndex(
            (u) => u.id === user.id || (u.email || '').toLowerCase() === (user.email || '').toLowerCase()
          );
          if (existingIndex >= 0) {
            dbState.users[existingIndex] = { ...dbState.users[existingIndex], ...user, updatedAt: new Date().toISOString() };
          } else {
            dbState.users.push({ ...user, updatedAt: new Date().toISOString() });
          }
          saveDb();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, user }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'JSON inválido' }));
        }
      });
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌐 Servidor de Sincronização EcoSmart Mobile Ativo!`);
  console.log(`📡 URL Base: http://localhost:${PORT}`);
  console.log(`🗄️  Banco Local: ${DB_FILE}`);
  console.log(`🚀 Conectado com Cidadão, Coletor e Admin em tempo real`);
  console.log(`======================================================\n`);
});

process.on('SIGINT', () => {
  console.log('\nEncerrando Servidor de Sincronização EcoSmart...');
  saveDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveDb();
  process.exit(0);
});
