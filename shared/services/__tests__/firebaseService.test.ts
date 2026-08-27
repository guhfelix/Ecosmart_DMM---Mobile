import { FirebaseService } from '../firebaseService';
import { DiscardItem, Usuario, WasteTypeItem, CollectionPointItem, EducationalTipItem } from '../../models';

describe('firebaseService (Operações Firestore e Cache Híbrido)', () => {
  let service: FirebaseService;

  beforeEach(() => {
    service = new FirebaseService();
  });

  it('deve inicializar com configurações customizadas', async () => {
    const success = await service.initializeApp({ projectId: 'ecosmart-custom' });
    expect(success).toBe(true);
    expect(service.getConfig().projectId).toBe('ecosmart-custom');
  });

  describe('Descartes', () => {
    it('deve salvar descarte e listar descartes disponíveis', async () => {
      const discard: DiscardItem = {
        id: 'test-disc-1',
        type: 'Plástico e PET',
        quantity: '5 garrafas',
        observation: 'Limpos',
        date: '26/08/2026',
        status: 'Pendente',
      };

      const saveRes = await service.saveDiscardDocument(discard);
      expect(saveRes.success).toBe(true);
      expect(saveRes.id).toBe('test-disc-1');

      const available = await service.getAvailableDiscards();
      expect(available.some((d) => d.id === 'test-disc-1')).toBe(true);
    });

    it('deve marcar descarte como coletado', async () => {
      const discard: DiscardItem = {
        id: 'test-disc-update',
        type: 'Vidro',
        quantity: '2 potes',
        observation: '',
        date: '26/08/2026',
        status: 'Pendente',
      };
      await service.saveDiscardDocument(discard);

      const success = await service.markDiscardAsCollected('test-disc-update', 'user-coletor-1');
      expect(success).toBe(true);
    });

    it('deve salvar descarte específico do cidadão e listar por e-mail', async () => {
      const citizenDiscard: DiscardItem = {
        id: 'test-citizen-disc-1',
        type: 'Papel e Papelão',
        quantity: '3 caixas',
        observation: 'Secos e dobrados',
        date: '27/08/2026',
        status: 'Pendente',
        cep: '78200-000',
        address: 'Rua Cel. José Dulce',
        neighborhood: 'Centro',
        city: 'Cáceres',
      };

      const user: Usuario = {
        id: 'user-cidadao-maria',
        nome: 'Maria Pantaneira',
        email: 'maria.pantaneira@gmail.com',
        perfil: 'cidadao',
      };

      const saveRes = await service.saveCitizenDiscard(citizenDiscard, user);
      expect(saveRes.success).toBe(true);

      const citizenList = await service.getDiscardsByCitizen('maria.pantaneira@gmail.com');
      expect(citizenList.some((d) => d.id === 'test-citizen-disc-1')).toBe(true);

      const callback = jest.fn();
      const unsub = service.subscribeToCitizenDiscards('maria.pantaneira@gmail.com', callback);
      expect(typeof unsub).toBe('function');
      unsub();
    });
  });

  describe('Usuários', () => {
    it('deve salvar e consultar documentos de usuário por e-mail', async () => {
      const user: Usuario = {
        id: 'user-test-1',
        nome: 'Teste Usuário',
        email: 'teste@gmail.com',
        perfil: 'cidadao',
      };

      const res = await service.saveUserDocument(user);
      expect(res).toBe(true);

      const fetched = await service.getUserByEmail('teste@gmail.com');
      expect(fetched?.nome).toBe('Teste Usuário');
    });
  });

  describe('Tipos de Resíduos', () => {
    it('deve permitir listar e salvar tipos de resíduos', async () => {
      const newWaste: WasteTypeItem = {
        id: 'waste-test-1',
        name: 'Óleo Usado',
        description: 'Armazene em garrafa PET bem vedada',
      };

      const saved = await service.saveWasteType(newWaste);
      expect(saved.id).toBe('waste-test-1');

      const all = await service.getWasteTypes();
      expect(all.some((w) => w.id === 'waste-test-1')).toBe(true);
    });
  });

  describe('Pontos de Coleta', () => {
    it('deve permitir listar e salvar pontos de coleta', async () => {
      const newPoint: CollectionPointItem = {
        id: 'point-test-1',
        name: 'PEV Teste',
        address: 'Rua Teste',
        acceptedWaste: 'Plástico',
        schedule: '08h às 17h',
        latitude: -16.07,
        longitude: -57.68,
      };

      const saved = await service.saveCollectionPoint(newPoint);
      expect(saved.id).toBe('point-test-1');

      const all = await service.getCollectionPoints();
      expect(all.some((p) => p.id === 'point-test-1')).toBe(true);
    });
  });

  describe('Dicas Educativas', () => {
    it('deve permitir listar e salvar dicas educativas', async () => {
      const newTip: EducationalTipItem = {
        id: 'tip-test-1',
        title: 'Preservação do Pantanal',
        category: 'Natureza',
        content: 'Não descarte óleo nos rios.',
      };

      const saved = await service.saveEducationalTip(newTip);
      expect(saved.id).toBe('tip-test-1');

      const all = await service.getEducationalTips();
      expect(all.some((t) => t.id === 'tip-test-1')).toBe(true);
    });
  });

  describe('Upload de Fotos', () => {
    it('deve retornar a URL de storage correspondente', async () => {
      const url = await service.uploadWastePhoto('file:///local/photo.jpg', 'disc-123');
      expect(url).toContain('waste_photos%2Fdisc-123.jpg');

      const remoteUrl = await service.uploadWastePhoto('https://firebasestorage.googleapis.com/...', 'disc-123');
      expect(remoteUrl).toBe('https://firebasestorage.googleapis.com/...');
    });
  });

  describe('Ouvintes em Tempo Real (Listeners Firestore)', () => {
    it('deve registrar e receber dados em tempo real para descartes', () => {
      const callback = jest.fn();
      const unsubscribe = service.subscribeToDiscards(callback);
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('deve registrar e receber dados em tempo real para tipos de resíduos', () => {
      const callback = jest.fn();
      const unsubscribe = service.subscribeToWasteTypes(callback);
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('deve registrar e receber dados em tempo real para pontos de coleta', () => {
      const callback = jest.fn();
      const unsubscribe = service.subscribeToCollectionPoints(callback);
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('deve registrar e receber dados em tempo real para dicas educativas', () => {
      const callback = jest.fn();
      const unsubscribe = service.subscribeToTips(callback);
      expect(callback).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
  });
});

