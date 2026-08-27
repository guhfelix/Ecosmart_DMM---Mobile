import { generateUUID, generateEntityId } from '../idUtils';

describe('idUtils (Identificadores Únicos Universais)', () => {
  describe('generateUUID', () => {
    it('deve gerar uma string no formato UUID v4 padrão (8-4-4-4-12)', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('deve gerar identificadores únicos e não repetitivos', () => {
      const ids = new Set();
      for (let i = 0; i < 50; i++) {
        ids.add(generateUUID());
      }
      expect(ids.size).toBe(50);
    });
  });

  describe('generateEntityId', () => {
    it('deve gerar IDs com prefixos semânticos corretos', () => {
      expect(generateEntityId('disc')).toMatch(/^disc-[0-9a-f]{8}$/);
      expect(generateEntityId('user')).toMatch(/^user-[0-9a-f]{8}$/);
      expect(generateEntityId('point')).toMatch(/^point-[0-9a-f]{8}$/);
      expect(generateEntityId('waste')).toMatch(/^waste-[0-9a-f]{8}$/);
      expect(generateEntityId('tip')).toMatch(/^tip-[0-9a-f]{8}$/);
      expect(generateEntityId('sess')).toMatch(/^sess-[0-9a-f]{8}$/);
      expect(generateEntityId('sync')).toMatch(/^sync-[0-9a-f]{8}$/);
    });
  });
});
