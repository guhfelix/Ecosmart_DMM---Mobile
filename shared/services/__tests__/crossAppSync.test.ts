jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { crossAppSync } from '../crossAppSync';
import { DiscardItem, Usuario } from '../../models';

describe('CrossAppSyncService (Comunicação Real-Time Multi-Apps)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar descartes do servidor de sincronização com sucesso', async () => {
    const mockDiscards = [
      {
        id: 'disc-test-1',
        citizenName: 'Maria Silva',
        wasteType: 'Vidro',
        quantity: '5 garrafas',
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

  it('deve enviar novo descarte com fallback resiliente', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    const newItem: DiscardItem = {
      id: 'disc-novo-1',
      type: 'Plástico e PET',
      quantity: '10 garrafas',
      observation: 'Limpo',
      date: '26/08/2026',
      status: 'Pendente',
      cep: '78200-000',
      address: 'Rua Cel. José Dulce',
      neighborhood: 'Centro',
      city: 'Cáceres',
    };

    const res = await crossAppSync.postNewDiscard(newItem);
    expect(res.success).toBe(true);
    expect(res.id).toBe('disc-novo-1');
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

  it('deve apagar um descarte de todos os canais', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as any);

    const res = await crossAppSync.deleteDiscard('disc-test-1');
    expect(res).toBe(true);
  });
});
