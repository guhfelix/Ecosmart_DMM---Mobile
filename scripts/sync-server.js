const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const DB_DIR = path.join(__dirname, '..', 'database', 'data');
const DB_FILE = path.join(DB_DIR, 'ecosmart-live-db.json');

// Garante que a pasta do banco existe
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (e) {}
}

const INITIAL_CACERES_DISCARDS = [];

const INITIAL_CACERES_USERS = [
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

const INITIAL_CACERES_ADMINS = [
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
];

let dbState = {
  discards: [...INITIAL_CACERES_DISCARDS],
  users: [...INITIAL_CACERES_USERS],
  admins: [...INITIAL_CACERES_ADMINS],
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
        users:
          Array.isArray(parsed.users) && parsed.users.length > 0
            ? parsed.users
            : INITIAL_CACERES_USERS,
        admins:
          Array.isArray(parsed.admins) && parsed.admins.length > 0
            ? parsed.admins
            : INITIAL_CACERES_ADMINS,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('⚠️ Erro ao ler banco local, inicializando com dados padrão:', err);
  }
} else {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2));
  } catch (e) {}
}

/**
 * Persiste o estado no arquivo JSON com verificação estrita de escrita (A4-14).
 * Retorna true em caso de sucesso ou false se writeFileSync falhar.
 */
function saveDb() {
  dbState.lastUpdated = new Date().toISOString();
  try {
    const targetFile = process.env.ECOSMART_DB_FILE || DB_FILE;
    fs.writeFileSync(targetFile, JSON.stringify(dbState, null, 2));
    return true;
  } catch (err) {
    console.error('⚠️ Erro ao salvar banco local:', err);
    return false;
  }
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-User-Id, X-User-Role, X-User-Email'
  );
}

/**
 * Extrai e valida o contexto de autenticação a partir dos cabeçalhos HTTP (A4-13).
 * Suporta:
 * - Authorization: Bearer eco_<userId>_<timestamp>_<uuid>
 * - Authorization: Bearer <jwt_ou_base64>
 * - Authorization: Bearer <userId>
 */
function extractAuthContext(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const trimmed = authHeader.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = trimmed.slice(7).trim();
  if (!token || token === 'null' || token === 'undefined' || token === 'invalid') {
    return null;
  }

  const headerUserId = req.headers['x-user-id'];
  const headerRole = req.headers['x-user-role'];
  const headerEmail = req.headers['x-user-email'];

  let userId = typeof headerUserId === 'string' ? headerUserId.trim() : '';
  let role = typeof headerRole === 'string' ? headerRole.trim().toLowerCase() : '';
  let email = typeof headerEmail === 'string' ? headerEmail.trim().toLowerCase() : '';

  // 1. Formato nativo EcoSmart: eco_<userId>_<timestamp>_<uuid>
  if (token.startsWith('eco_')) {
    const withoutPrefix = token.slice(4);
    const parts = withoutPrefix.split('_');
    if (parts.length >= 3) {
      const extractedUserId = parts.slice(0, parts.length - 2).join('_');
      if (!userId && extractedUserId) {
        userId = extractedUserId;
      }
    } else if (!userId && parts[0]) {
      userId = parts[0];
    }
  } else if (token.split('.').length === 3) {
    // 2. Formato JWT (ex: Firebase ID Token)
    try {
      const payloadJson = Buffer.from(token.split('.')[1], 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);
      userId = userId || payload.user_id || payload.uid || payload.sub || '';
      role = role || payload.role || payload.perfil || '';
      email = email || (payload.email || '').toLowerCase();
    } catch (e) {
      return null;
    }
  } else if (token.includes(':')) {
    // 3. Formato <userId>:<role>
    const [tUid, tRole, tEmail] = token.split(':');
    userId = userId || tUid;
    role = role || tRole;
    if (tEmail) email = email || tEmail.toLowerCase();
  } else if (!userId) {
    userId = token;
  }

  if (!userId) {
    return null;
  }

  // Enriquecimento com base nos usuários/admins conhecidos no servidor
  const knownAdmin = dbState.admins.find(
    (a) => a.id === userId || (email && (a.email || '').toLowerCase() === email)
  );
  const knownUser = dbState.users.find(
    (u) => u.id === userId || (email && (u.email || '').toLowerCase() === email)
  );

  if (!role) {
    if (knownAdmin || userId.includes('admin')) {
      role = 'admin';
    } else if (knownUser) {
      role = knownUser.perfil || 'cidadao';
    } else if (userId.includes('coletor')) {
      role = 'coletor';
    } else {
      role = 'cidadao';
    }
  }

  if (!email) {
    if (knownAdmin) email = (knownAdmin.email || '').toLowerCase();
    else if (knownUser) email = (knownUser.email || '').toLowerCase();
  }

  return {
    token,
    userId,
    role,
    email,
  };
}

/**
 * Verifica se o usuário autenticado é proprietário do descarte ou administrador (A4-13).
 */
function isOwnerOrAdmin(auth, discard) {
  if (!auth) return false;
  if (auth.role === 'admin') return true;

  const itemUserId = discard.userId || discard.citizenId || discard.usuario_id || discard.usuarioId;
  const itemEmail = (discard.citizenEmail || discard.email || '').trim().toLowerCase();

  if (itemUserId && auth.userId === itemUserId) {
    return true;
  }
  if (!itemUserId && itemEmail && auth.email && itemEmail === auth.email) {
    return true;
  }
  return false;
}

/**
 * Valida se a quantidade informada é coerente e maior que zero (A4-09).
 */
function validateQuantityInput(quantity) {
  if (quantity === undefined || quantity === null) {
    return { valid: false, message: 'O campo quantidade é obrigatório.' };
  }
  if (typeof quantity === 'number') {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { valid: false, message: 'A quantidade numérica deve ser maior que zero.' };
    }
    return { valid: true };
  }
  if (typeof quantity === 'string') {
    const trimmed = quantity.trim();
    if (!trimmed) {
      return { valid: false, message: 'A quantidade não pode ser vazia.' };
    }
    // Bloqueia valores negativos ou zero explícito (ex: "0", "-5", "0 kg")
    const numMatch = trimmed.match(/^-?\d+([.,]\d+)?/);
    if (numMatch) {
      const val = parseFloat(numMatch[0].replace(',', '.'));
      if (isNaN(val) || val <= 0) {
        return { valid: false, message: 'A quantidade deve ser maior que zero.' };
      }
      return { valid: true };
    }
    return { valid: false, message: 'A quantidade deve conter um valor numérico válido maior que zero.' };
  }
  return { valid: false, message: 'Formato de quantidade inválido.' };
}

/**
 * Normaliza datas para ISO 8601 UTC (A4-16).
 */
function toIsoDate(value) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      return trimmed;
    }
    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const [, dd, mm, yyyy] = brMatch;
      return new Date(`${yyyy}-${mm}-${dd}T12:00:00.000Z`).toISOString();
    }
    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }
  return new Date().toISOString();
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
    res.end(
      JSON.stringify({
        status: 'ok',
        time: new Date().toISOString(),
        discardsCount: dbState.discards.length,
      })
    );
    return;
  }

  // --- Rotas de Descartes (/api/discards) ---
  if (pathname === '/api/discards') {
    if (req.method === 'GET') {
      const queryUserId = url.searchParams.get('userId') || url.searchParams.get('usuarioId');
      const queryEmail = url.searchParams.get('email') || url.searchParams.get('citizenEmail');

      let filteredDiscards = dbState.discards;
      if (queryUserId) {
        filteredDiscards = filteredDiscards.filter(
          (d) =>
            d.userId === queryUserId ||
            d.citizenId === queryUserId ||
            d.usuario_id === queryUserId
        );
      } else if (queryEmail) {
        const lowerEmail = queryEmail.trim().toLowerCase();
        filteredDiscards = filteredDiscards.filter(
          (d) => (d.citizenEmail || '').trim().toLowerCase() === lowerEmail
        );
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filteredDiscards));
      return;
    }

    if (req.method === 'POST') {
      const auth = extractAuthContext(req);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Não autorizado: token de autenticação ausente ou inválido.',
          })
        );
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          if (!body || !body.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Corpo da requisição vazio.' }));
            return;
          }

          const item = JSON.parse(body);
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Corpo JSON deve ser um objeto válido.' }));
            return;
          }

          const rawType = (item.type || item.wasteType || item.tipoResiduo || '').toString().trim();
          if (!rawType) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'O tipo de resíduo (type/wasteType) é obrigatório.' }));
            return;
          }

          if (item.quantity !== undefined) {
            const qtyValidation = validateQuantityInput(item.quantity);
            if (!qtyValidation.valid) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: qtyValidation.message }));
              return;
            }
          }

          const targetOwnerId = item.userId || item.citizenId || item.usuario_id || auth.userId;
          if (
            auth.role !== 'admin' &&
            item.userId &&
            item.userId !== auth.userId
          ) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Acesso proibido: não é permitido criar descartes em nome de outro usuário.',
              })
            );
            return;
          }

          const id = item.id || `disc-${Date.now()}`;
          const existingIndex = dbState.discards.findIndex((d) => d.id === id);
          if (existingIndex >= 0) {
            const existing = dbState.discards[existingIndex];
            if (!isOwnerOrAdmin(auth, existing)) {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: 'Acesso proibido: este registro pertence a outro usuário.',
                })
              );
              return;
            }
          }

          const nowIso = new Date().toISOString();
          const createdIso = toIsoDate(item.createdAt || item.date);
          const isCollected = (item.status || '').toLowerCase() === 'coletado';

          const normalized = {
            id,
            userId: targetOwnerId,
            citizenId: targetOwnerId,
            citizenEmail: item.citizenEmail || item.email || auth.email || 'maria@gmail.com',
            citizenName: item.citizenName || item.nome_cidadao || 'Maria Cidadã Pantaneira',
            wasteType: rawType,
            type: rawType,
            quantity: item.quantity !== undefined ? item.quantity : 1,
            unit: item.unit || 'unidade',
            address: item.address || 'Cáceres - MT',
            number: item.number || item.numero || '',
            numero: item.numero || item.number || '',
            neighborhood: item.neighborhood || 'Centro',
            city: item.city || 'Cáceres',
            cep: item.cep || '78200-000',
            observation: item.observation || '',
            status: isCollected ? 'coletado' : 'pendente',
            createdAt: createdIso,
            date: item.date || createdIso,
            collectedAt: item.collectedAt ? toIsoDate(item.collectedAt) : undefined,
            coletorId: item.coletorId,
            latitude: typeof item.latitude === 'number' ? item.latitude : -16.0725,
            longitude: typeof item.longitude === 'number' ? item.longitude : -57.6798,
            distanceKm: typeof item.distanceKm === 'number' ? item.distanceKm : 0.8,
            photoUri: item.photoUri,
            updatedAt: nowIso,
          };

          const snapshotBefore = [...dbState.discards];
          if (existingIndex >= 0) {
            dbState.discards[existingIndex] = { ...dbState.discards[existingIndex], ...normalized };
          } else {
            dbState.discards.unshift(normalized);
          }

          if (!saveDb()) {
            dbState.discards = snapshotBefore;
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Falha ao persistir dados no armazenamento do servidor.',
              })
            );
            return;
          }

          console.log(
            `[EcoSmart Sync] 📦 Descarte salvo: ${id} (${normalized.wasteType}) por ${normalized.citizenName}`
          );

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

  // --- Rota de Edição e Exclusão de Descarte por ID (/api/discards/:id) ---
  const itemMatch = pathname.match(/^\/api\/discards\/([^/]+)$/);
  if (itemMatch) {
    const discardId = itemMatch[1];

    // PUT ou PATCH /api/discards/:id (A4-02)
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const auth = extractAuthContext(req);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Não autorizado: token de autenticação ausente ou inválido.',
          })
        );
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          if (!body || !body.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Corpo da requisição vazio.' }));
            return;
          }

          const updates = JSON.parse(body);
          if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Dados de atualização inválidos.' }));
            return;
          }

          const existingIndex = dbState.discards.findIndex((d) => d.id === discardId);
          if (existingIndex < 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Descarte não encontrado.' }));
            return;
          }

          const existing = dbState.discards[existingIndex];
          if (!isOwnerOrAdmin(auth, existing)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Acesso proibido: você só pode editar seus próprios descartes.',
              })
            );
            return;
          }

          if (updates.type !== undefined || updates.wasteType !== undefined) {
            const nextType = (updates.type ?? updates.wasteType ?? '').toString().trim();
            if (!nextType) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'O tipo de resíduo não pode ser vazio.' }));
              return;
            }
          }

          if (updates.quantity !== undefined) {
            const qtyCheck = validateQuantityInput(updates.quantity);
            if (!qtyCheck.valid) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: qtyCheck.message }));
              return;
            }
          }

          const resolvedType =
            updates.type !== undefined || updates.wasteType !== undefined
              ? (updates.type || updates.wasteType).toString().trim()
              : existing.wasteType || existing.type;

          const nowIso = new Date().toISOString();
          const updatedItem = {
            ...existing,
            id: existing.id, // Preserva estritamente o ID original (A4-01 / A4-02)
            userId: existing.userId,
            citizenId: existing.citizenId,
            type: resolvedType,
            wasteType: resolvedType,
            quantity: updates.quantity !== undefined ? updates.quantity : existing.quantity,
            unit: updates.unit !== undefined ? updates.unit : existing.unit,
            observation:
              updates.observation !== undefined ? updates.observation : existing.observation,
            cep: updates.cep !== undefined ? updates.cep : existing.cep,
            address: updates.address !== undefined ? updates.address : existing.address,
            number:
              updates.number !== undefined
                ? updates.number
                : updates.numero !== undefined
                ? updates.numero
                : existing.number,
            numero:
              updates.numero !== undefined
                ? updates.numero
                : updates.number !== undefined
                ? updates.number
                : existing.numero,
            neighborhood:
              updates.neighborhood !== undefined ? updates.neighborhood : existing.neighborhood,
            city: updates.city !== undefined ? updates.city : existing.city,
            latitude:
              typeof updates.latitude === 'number' ? updates.latitude : existing.latitude,
            longitude:
              typeof updates.longitude === 'number' ? updates.longitude : existing.longitude,
            photoUri: updates.photoUri !== undefined ? updates.photoUri : existing.photoUri,
            // Preserva os campos de coleta a menos que atualizado por admin
            status:
              auth.role === 'admin' && updates.status
                ? updates.status.toLowerCase() === 'coletado'
                  ? 'coletado'
                  : 'pendente'
                : existing.status,
            updatedAt: nowIso,
          };

          const previousItem = dbState.discards[existingIndex];
          dbState.discards[existingIndex] = updatedItem;

          if (!saveDb()) {
            dbState.discards[existingIndex] = previousItem;
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Falha ao persistir atualização no banco do servidor.',
              })
            );
            return;
          }

          console.log(`[EcoSmart Sync] ✏️ Descarte ${discardId} atualizado com sucesso`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, item: updatedItem }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'JSON inválido' }));
        }
      });
      return;
    }

    // DELETE /api/discards/:id (A4-05 / A4-13)
    if (req.method === 'DELETE') {
      const auth = extractAuthContext(req);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Não autorizado: token de autenticação ausente ou inválido.',
          })
        );
        return;
      }

      const existing = dbState.discards.find((d) => d.id === discardId);
      if (existing && !isOwnerOrAdmin(auth, existing)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Acesso proibido: você não tem permissão para excluir o descarte de outro usuário.',
          })
        );
        return;
      }

      const snapshotBefore = [...dbState.discards];
      const initialLength = dbState.discards.length;
      dbState.discards = dbState.discards.filter((d) => d.id !== discardId);

      if (!saveDb()) {
        dbState.discards = snapshotBefore;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Falha ao persistir exclusão no banco do servidor.',
          })
        );
        return;
      }

      console.log(`[EcoSmart Sync] 🗑️ Descarte ${discardId} excluído com sucesso`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          id: discardId,
          deleted: dbState.discards.length < initialLength,
        })
      );
      return;
    }
  }

  // --- Rota de Baixa de Coleta (/api/discards/:id/collect) ---
  const collectMatch = pathname.match(/^\/api\/discards\/([^/]+)\/collect$/);
  if (collectMatch && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
    const auth = extractAuthContext(req);
    if (!auth) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Não autorizado: token de autenticação ausente ou inválido.',
        })
      );
      return;
    }

    if (auth.role !== 'coletor' && auth.role !== 'admin') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Acesso proibido: apenas coletores ou administradores podem dar baixa em coletas.',
        })
      );
      return;
    }

    const discardId = collectMatch[1];
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      let coletorId = auth.userId || 'user-coletor-1';
      try {
        if (body) {
          const parsed = JSON.parse(body);
          if (parsed.coletorId) coletorId = parsed.coletorId;
        }
      } catch (e) {}

      const foundIndex = dbState.discards.findIndex((d) => d.id === discardId);
      if (foundIndex >= 0) {
        const previous = { ...dbState.discards[foundIndex] };
        const nowIso = new Date().toISOString();
        dbState.discards[foundIndex] = {
          ...previous,
          status: 'coletado',
          collectedAt: nowIso,
          coletorId,
          updatedAt: nowIso,
        };

        if (!saveDb()) {
          dbState.discards[foundIndex] = previous;
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Falha ao persistir baixa de coleta no banco do servidor.',
            })
          );
          return;
        }

        console.log(
          `[EcoSmart Sync] 🚛 Descarte ${discardId} marcado como COLETADO por ${coletorId}`
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, item: dbState.discards[foundIndex] }));
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
      const auth = extractAuthContext(req);
      if (!auth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Não autorizado: token de autenticação ausente ou inválido.',
          })
        );
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const user = JSON.parse(body);
          if (!user || typeof user !== 'object' || (!user.id && !user.email)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Dados de usuário inválidos.' }));
            return;
          }

          if (
            auth.role !== 'admin' &&
            user.id &&
            user.id !== auth.userId &&
            (!auth.email || (user.email || '').toLowerCase() !== auth.email)
          ) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Acesso proibido: você só pode alterar seu próprio perfil.',
              })
            );
            return;
          }

          // Nunca persiste senha em texto puro no servidor JSON (A4-11)
          const { password: _p, passwordHash: _ph, ...safeUser } = user;
          const snapshotBefore = [...dbState.users];
          const existingIndex = dbState.users.findIndex(
            (u) =>
              u.id === safeUser.id ||
              (u.email || '').toLowerCase() === (safeUser.email || '').toLowerCase()
          );
          if (existingIndex >= 0) {
            dbState.users[existingIndex] = {
              ...dbState.users[existingIndex],
              ...safeUser,
              updatedAt: new Date().toISOString(),
            };
          } else {
            dbState.users.push({ ...safeUser, updatedAt: new Date().toISOString() });
          }

          if (!saveDb()) {
            dbState.users = snapshotBefore;
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Falha ao persistir usuário no banco do servidor.',
              })
            );
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, user: safeUser }));
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

if (require.main === module) {
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.log(`\n======================================================`);
      console.log(`✅ Servidor EcoSmart já está em execução na porta ${PORT}.`);
      console.log(`📡 Reutilizando instância existente em http://localhost:${PORT}`);
      console.log(`======================================================\n`);
      process.exit(0);
    }
    console.error('⚠️ Erro no Servidor de Sincronização EcoSmart:', err.message || err);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🌐 Servidor de Sincronização EcoSmart Mobile Ativo!`);
    console.log(`📡 URL Base (Local): http://localhost:${PORT}`);
    console.log(`📱 Rede Local (LAN): Escutando em 0.0.0.0:${PORT} (Dispositivos Físicos / Emulador)`);
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
}

module.exports = {
  server,
  saveDb,
  extractAuthContext,
  validateQuantityInput,
  toIsoDate,
  dbState,
};
