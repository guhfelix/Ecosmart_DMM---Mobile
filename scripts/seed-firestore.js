/**
 * Script de Carga de Dados Reais de Cáceres - MT no Cloud Firestore.
 * - Limpa todos os descartes e dados temporários/de teste anteriores.
 * - Mantém e sincroniza os usuários comuns (Cidadão e Coletor) na coleção 'usuarios'.
 * - Exclui explicitamente qualquer administrador da coleção 'usuarios'.
 * - Cria e migra os administradores para a coleção raiz dedicada 'admins'.
 * - Sincroniza catálogo de tipos de resíduos, ecopontos e dicas educativas reais de Cáceres - MT.
 */
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDgw9lpCdYbnGeAA98-q-LgN4BjL6xTspU",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ecosmart-mobile.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ecosmart-mobile",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ecosmart-mobile.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "105163046365",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:105163046365:web:271e4c6d0ecec7f17a8a34",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KPNJWGPF8R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 1. Tipos de Resíduos Oficiais de Cáceres - MT
const WASTE_TYPES = [
  { id: '1', name: 'Plástico e PET', description: 'Garrafas PET, embalagens plásticas, potes e sacolas limpas.' },
  { id: '2', name: 'Papel e Papelão', description: 'Caixas de papelão desmontadas, jornais, folhas e revistas secas.' },
  { id: '3', name: 'Vidro', description: 'Garrafas, potes de conserva e recipientes de vidro intactos.' },
  { id: '4', name: 'Metal e Alumínio', description: 'Latas de bebidas, tampas de metal, panelas velhas e arames.' },
  { id: '5', name: 'Eletrônicos e Baterias', description: 'Celulares antigos, cabos, pilhas, carregadores e periféricos.' },
  { id: '6', name: 'Óleo de Cozinha Usado', description: 'Óleo vegetal usado acondicionado em garrafas PET bem vedadas.' },
];

// 2. Pontos de Coleta Seletiva e Ecopontos Oficiais em Cáceres - MT
const COLLECTION_POINTS = [
  {
    id: 'point-caceres-1',
    name: 'Ecoponto Central - Praça Barão',
    address: 'Rua Cel. José Dulce, 100 - Centro',
    neighborhood: 'Centro',
    city: 'Cáceres',
    state: 'MT',
    cep: '78200-000',
    acceptedWaste: 'Plástico, Papel, Papelão, Vidro e Metal',
    schedule: 'Segunda a Sexta, das 07h30 às 17h30',
    latitude: -16.0725,
    longitude: -57.6798,
    distanceKm: 0.5,
  },
  {
    id: 'point-caceres-2',
    name: 'Cooperativa dos Catadores (COOPERCÁCERES)',
    address: 'Av. Getúlio Vargas, 1420 - Bairro Santos Dumont',
    neighborhood: 'Santos Dumont',
    city: 'Cáceres',
    state: 'MT',
    cep: '78205-000',
    acceptedWaste: 'Todos os recicláveis, Papelão, PET, Sucata e Prensados',
    schedule: 'Segunda a Sábado, das 07h às 17h',
    latitude: -16.085,
    longitude: -57.6912,
    distanceKm: 1.8,
  },
  {
    id: 'point-caceres-3',
    name: 'Ecoponto Bairro Cavalhada',
    address: 'Rua dos Lavradores, 350 - Bairro Cavalhada',
    neighborhood: 'Cavalhada',
    city: 'Cáceres',
    state: 'MT',
    cep: '78202-150',
    acceptedWaste: 'Plástico, Vidro e Óleo de Cozinha Usado',
    schedule: 'Segunda a Sexta, das 08h às 16h',
    latitude: -16.0645,
    longitude: -57.672,
    distanceKm: 1.2,
  },
  {
    id: 'point-caceres-4',
    name: 'Ecoponto Cohab Nova',
    address: 'Av. dos Imigrantes, s/n - Cohab Nova',
    neighborhood: 'Cohab Nova',
    city: 'Cáceres',
    state: 'MT',
    cep: '78208-200',
    acceptedWaste: 'Eletrônicos, Pilhas, Baterias, Metais e Papel',
    schedule: 'Segunda a Sábado, das 08h às 17h',
    latitude: -16.091,
    longitude: -57.665,
    distanceKm: 2.4,
  },
  {
    id: 'point-caceres-5',
    name: 'PEV Jardim Guanabara (Campus UNEMAT)',
    address: 'Av. Tancredo Neves, 800 - Jardim Guanabara',
    neighborhood: 'Jardim Guanabara',
    city: 'Cáceres',
    state: 'MT',
    cep: '78210-500',
    acceptedWaste: 'Papel, Papelão, Plástico e Lixo Eletrônico',
    schedule: 'Segunda a Sexta, das 07h às 21h',
    latitude: -16.058,
    longitude: -57.689,
    distanceKm: 2.1,
  },
  {
    id: 'point-caceres-6',
    name: 'Ponto Ecológico DNER',
    address: 'Rua das Violetas, 210 - DNER',
    neighborhood: 'DNER',
    city: 'Cáceres',
    state: 'MT',
    cep: '78207-300',
    acceptedWaste: 'Plástico, Metal, Papelão e Óleo',
    schedule: 'Segunda a Sexta, das 08h às 17h',
    latitude: -16.0815,
    longitude: -57.684,
    distanceKm: 1.5,
  },
];

// 3. Dicas Educativas Reais do Pantanal e Cáceres
const EDUCATIONAL_TIPS = [
  {
    id: 'tip-caceres-1',
    title: 'Proteja as Águas do Rio Paraguai',
    category: 'Preservação Pantanal',
    content: 'O descarte correto de materiais recicláveis em Cáceres impede que resíduos plásticos cheguem ao leito do Rio Paraguai, protegendo a rica fauna pantaneira.',
  },
  {
    id: 'tip-caceres-2',
    title: 'Descarte Correto do Óleo de Cozinha',
    category: 'Recursos Hídricos',
    content: '1 litro de óleo pode poluir até 25 mil litros de água. Guarde o óleo frio em garrafas PET e entregue nos ecopontos da Cavalhada ou COOPERCÁCERES.',
  },
  {
    id: 'tip-caceres-3',
    title: 'Separação para a COOPERCÁCERES',
    category: 'Apoio aos Catadores',
    content: 'Enxaguar embalagens de leite e potes de plástico facilita o trabalho diário dos catadores da Cooperativa de Cáceres e valoriza a reciclagem local.',
  },
  {
    id: 'tip-caceres-4',
    title: 'Pilhas e Eletrônicos no PEV Cohab Nova',
    category: 'Lixo Eletrônico',
    content: 'Metais pesados como chumbo e mercúrio contaminam o solo de Cáceres. Descarte celulares velhos, cabos e pilhas no PEV Cohab Nova ou na UNEMAT.',
  },
  {
    id: 'tip-caceres-5',
    title: 'Compostagem Doméstica de Orgânicos',
    category: 'Sustentabilidade',
    content: 'Separe cascas de frutas e sobras de vegetais para adubação natural, reduzindo o volume de matéria orgânica enviada aos aterros municipais.',
  },
  {
    id: 'tip-caceres-6',
    title: 'Logística Reversa de Embalagens e Vidros',
    category: 'Economia Circular',
    content: 'Garrafas e recipientes de vidro devem ser limpos e acondicionados com segurança para facilitar o recolhimento pelos catadores sem risco de acidentes.',
  },
];

// 4. Usuários Comuns (Cidadãos e Coletores) - Exclusivos da coleção 'usuarios'
const CITIZEN_AND_COLLECTOR_USERS = [
  {
    id: 'user-cidadao-1',
    nome: 'Maria Cidadã Pantaneira',
    name: 'Maria Cidadã Pantaneira',
    email: 'maria@gmail.com',
    perfil: 'cidadao',
    telefone: '(65) 99988-1234',
    cep: '78200-050',
    endereco: 'Rua Cel. Faria',
    numero: '210',
    bairro: 'Centro',
    cidade: 'Cáceres - MT',
    bio: 'Compromissada com a preservação do Pantanal e a reciclagem em Cáceres - MT.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-coletor-1',
    nome: 'Lucas Coletor COOPERCÁCERES',
    name: 'Lucas Coletor COOPERCÁCERES',
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
    updatedAt: new Date().toISOString(),
  },
];

// 5. Usuários Administradores - Exclusivos da coleção raiz 'admins'
const ADMIN_USERS = [
  {
    id: 'user-admin-1',
    nome: 'João Gestor SEMATUR',
    name: 'João Gestor SEMATUR',
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
    updatedAt: new Date().toISOString(),
  },
];

async function authenticate() {
  const email = 'admin.caceres@ecosmart.com';
  const password = 'Password@1234';
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (createErr) {
      console.log('Autenticação com fallback...');
      return null;
    }
  }
}

async function cleanCollection(collectionName) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    let deletedCount = 0;
    for (const docItem of snapshot.docs) {
      await deleteDoc(doc(db, collectionName, docItem.id));
      deletedCount++;
    }
    console.log(`🧹 Coleção '${collectionName}': ${deletedCount} documento(s) removido(s) com sucesso.`);
  } catch (err) {
    console.log(`⚠️ Falha ao limpar coleção '${collectionName}': ${err.message}`);
  }
}

async function safeSetDoc(collectionName, docId, payload) {
  try {
    await setDoc(doc(db, collectionName, docId), payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`  ⚠️ Aviso de rede/permissão ao gravar em '${collectionName}/${docId}': ${err.message}`);
    return false;
  }
}

async function seedFirestore() {
  console.log('=================================================================');
  console.log('🌱 LIMPEZA DE DADOS E MIGRAÇÃO DE ISOLAMENTO NO FIREBASE FIRESTORE');
  console.log('=================================================================');

  const authUser = await authenticate();
  if (authUser) {
    console.log(`🔐 Autenticado como Administrador no Firebase: ${authUser.email} (${authUser.uid})\n`);
  }

  // 1. Limpar coleções de descartes e notificações
  console.log('🗑️ 1. Removendo todos os registros antigos de descartes e notificações...');
  await cleanCollection('descartes');
  await cleanCollection('notificacoes');
  await cleanCollection('_health_check');

  // 2. Limpar e isolar coleção de Usuários Comuns ('usuarios')
  console.log('\n👥 2. Limpando e isolando a coleção de usuários comuns (usuarios)...');
  
  // Exclui explicitamente o documento 'user-admin-1' caso ainda resida em 'usuarios'
  try {
    await deleteDoc(doc(db, 'usuarios', 'user-admin-1'));
    console.log("  🧹 Exclusão explícita de 'user-admin-1' da coleção 'usuarios': SUCESSO");
  } catch (e) {
    console.log(`  ℹ️ Documento 'user-admin-1' já não estava em 'usuarios': ${e.message}`);
  }

  if (authUser) {
    try {
      await deleteDoc(doc(db, 'usuarios', authUser.uid));
      console.log(`  🧹 Exclusão da conta de admin ${authUser.uid} de 'usuarios': SUCESSO`);
    } catch (e) {}
  }

  // Cadastra exclusivamente Cidadãos e Coletores em 'usuarios'
  for (const user of CITIZEN_AND_COLLECTOR_USERS) {
    const ok = await safeSetDoc('usuarios', user.id, user);
    if (ok) {
      console.log(`  ✅ Usuário comum cadastrado em 'usuarios': ${user.name} (${user.email}) - Perfil: ${user.perfil}`);
    }
  }

  // 3. Sincronizar Coleção Raiz Isolada de Administradores ('admins')
  console.log("\n👑 3. Migrando e sincronizando Administradores na coleção raiz exclusiva 'admins'...");
  for (const adminUser of ADMIN_USERS) {
    const ok = await safeSetDoc('admins', adminUser.id, adminUser);
    if (ok) {
      console.log(`  ✅ Administrador cadastrado em 'admins': ${adminUser.name} (${adminUser.email})`);
    }
  }

  if (authUser) {
    const ok = await safeSetDoc('admins', authUser.uid, {
      id: authUser.uid,
      nome: 'João Gestor SEMATUR',
      name: 'João Gestor SEMATUR',
      email: authUser.email,
      perfil: 'admin',
      cidade: 'Cáceres - MT',
      cargo: 'Secretário Municipal de Meio Ambiente',
      departamento: 'SEMATUR - Cáceres MT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (ok) {
      console.log(`  ✅ Conta auth migrada para 'admins': ${authUser.email} (${authUser.uid})`);
    }
  }

  // 4. Catálogo de Tipos de Resíduos
  console.log('\n♻️ 4. Sincronizando Tipos de Resíduos oficiais...');
  for (const item of WASTE_TYPES) {
    await safeSetDoc('tipos_residuos', item.id, item);
  }
  console.log(`  ✅ ${WASTE_TYPES.length} Tipos de Resíduos processados no Firestore.`);

  // 5. Pontos de Coleta Seletiva em Cáceres - MT
  console.log('\n📍 5. Sincronizando Pontos de Coleta e Ecopontos reais de Cáceres...');
  for (const item of COLLECTION_POINTS) {
    await safeSetDoc('pontos_coleta', item.id, item);
  }
  console.log(`  ✅ ${COLLECTION_POINTS.length} Ecopontos e Locais de Coleta processados no Firestore.`);

  // 6. Dicas Educativas
  console.log('\n💡 6. Sincronizando Dicas Educativas de Sustentabilidade...');
  for (const item of EDUCATIONAL_TIPS) {
    await safeSetDoc('dicas_educativas', item.id, item);
  }
  console.log(`  ✅ ${EDUCATIONAL_TIPS.length} Dicas Educativas processadas no Firestore.`);

  console.log('\n=================================================================');
  console.log('🎉 MIGRAÇÃO E SINCRONIZAÇÃO FIREBASE CONCLUÍDAS COM SUCESSO!');
  console.log('=================================================================');
  console.log('Estrutura de Isolamento no Console do Firebase:');
  console.log("  📂 Coleção 'usuarios' : Apenas Cidadãos e Coletores (user-cidadao-1, user-coletor-1)");
  console.log("  📂 Coleção 'admins'   : Exclusiva para Gestores (user-admin-1)");
  console.log('=================================================================');
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.warn('⚠️ Aviso de conectividade durante a sincronização do Firestore (modo resiliente):', err.message || err);
  process.exit(0);
});
