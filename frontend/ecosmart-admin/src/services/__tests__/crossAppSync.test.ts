jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { crossAppSync, resolveSyncServerUrl } from '../crossAppSync';
import { DiscardItem, Usuario } from '../../models';

describe('CrossAppSyncService (Comunicação Real-Time, Edição PUT e Verificação de Rede - A4-02, A4-07, A4-15)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar descartes do servidor de sincronização com sucesso', async () => {
    const mockDiscards = [
      {
        id: 'disc-test-1',
        citizenName: 'Maria Silva',
        wasteType: 'Vidro',
        quantity: 5,
        unit: 'unidade',
        status: 'pendente',
        neighborhood: 'Centro',
        address: 'Rua Cel. Faria, 210',
        city: 'Cáceres',
        cep: '78200-050',
      },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiscards,
    } as any);

    const result = await crossAppSync.fetchAllDiscards();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('disc-test-1');
    expect(result[0].wasteType).toBe('Vidro');
  });

  it('deve enviar novo descarte e retornar remoteSynced: true quando HTTP 201', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true }),
    } as any);

    const newItem: DiscardItem = {
      id: 'disc-novo-1',
      type: 'Plástico e PET',
      quantity: 10,
      unit: 'unidade',
      observation: 'Limpo',
      date: '2026-08-26T12:00:00.000Z',
      status: 'Pendente',
      cep: '78200-000',
      address: 'Rua Cel. José Dulce',
      neighborhood: 'Centro',
      city: 'Cáceres',
    };

    const res = await crossAppSync.postNewDiscard(newItem);
    expect(res.success).toBe(true);
    expect(res.remoteSynced).toBe(true);
    expect(res.id).toBe('disc-novo-1');
  });

  it('deve retornar success: false e remoteSynced: false quando o servidor retornar erro HTTP (A4-07)', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Falha ao persistir' }),
    } as any);

    const newItem: DiscardItem = {
      id: 'disc-falha-1',
      type: 'Metal',
      quantity: 3,
      unit: 'kg',
      observation: '',
      date: '2026-08-26T12:00:00.000Z',
      status: 'Pendente',
    };

    const res = await crossAppSync.postNewDiscard(newItem);
    expect(res.success).toBe(false);
    expect(res.remoteSynced).toBe(false);
    expect(res.localSaved).toBe(true);
  });

  it('deve atualizar um descarte existente via PUT /api/discards/:id preservando o ID (A4-01 / A4-02)', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as any);

    const res = await crossAppSync.updateDiscard('disc-novo-1', {
      type: 'Vidro',
      quantity: 4,
      unit: 'kg',
      observation: 'Atualizado',
    });

    expect(res.success).toBe(true);
    expect(res.remoteSynced).toBe(true);
    expect(res.id).toBe('disc-novo-1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/discards/disc-novo-1'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('deve marcar descarte como coletado e sincronizar a baixa', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    const res = await crossAppSync.markAsCollected('disc-novo-1', 'user-coletor-1');
    expect(res).toBe(true);
  });

  it('deve sincronizar o perfil do usuário', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    const user: Usuario = {
      id: 'user-cidadao-1',
      nome: 'Maria Cidadã Atualizada',
      email: 'maria@gmail.com',
      perfil: 'cidadao',
    };

    const res = await crossAppSync.syncUserProfile(user);
    expect(res).toBe(true);
  });

  it('deve apagar um descarte de todos os canais com confirmação real', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    const res = await crossAppSync.deleteDiscard('disc-test-1');
    expect(res).toBe(true);
  });

  it('deve resolver EXPO_PUBLIC_SYNC_SERVER_URL quando configurado (A4-15)', () => {
    const prev = process.env.EXPO_PUBLIC_SYNC_SERVER_URL;
    process.env.EXPO_PUBLIC_SYNC_SERVER_URL = 'http://192.168.1.50:3333/';
    expect(resolveSyncServerUrl()).toBe('http://192.168.1.50:3333');
    if (prev === undefined) {
      delete process.env.EXPO_PUBLIC_SYNC_SERVER_URL;
    } else {
      process.env.EXPO_PUBLIC_SYNC_SERVER_URL = prev;
    }
  });

  it('deve monitorar saúde do servidor via checkServerHealth e emitir HEALTH_RESTORED ao recuperar conexão', async () => {
    const healthStates: boolean[] = [];
    const receivedEvents: string[] = [];
    const unsubHealth = crossAppSync.onHealthChange((healthy) => healthStates.push(healthy));
    const unsubEvents = crossAppSync.onSyncEvent((ev) => receivedEvents.push(ev.type));

    // Simula queda do servidor
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network request failed'));
    const firstCheck = await crossAppSync.checkServerHealth();
    expect(firstCheck).toBe(false);
    expect(crossAppSync.isServerHealthy()).toBe(false);

    // Simula recuperação do servidor
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as any);
    const secondCheck = await crossAppSync.checkServerHealth();
    expect(secondCheck).toBe(true);
    expect(crossAppSync.isServerHealthy()).toBe(true);
    expect(healthStates).toContain(false);
    expect(healthStates).toContain(true);
    expect(receivedEvents).toContain('HEALTH_RESTORED');

    unsubHealth();
    unsubEvents();
  });
});
