import {
  calculateDistanceKm,
  formatDistance,
  sortItemsByDistance,
  getGoogleMapsNavigationUrl,
  getWazeNavigationUrl,
} from '../geoUtils';

describe('geoUtils (Cálculo de Distâncias e Rotas)', () => {
  const caceresCenter = { latitude: -16.0744, longitude: -57.6789 };
  const unematCampus = { latitude: -16.0682, longitude: -57.6821 };

  describe('calculateDistanceKm', () => {
    it('deve retornar 0 para o mesmo ponto geográfico', () => {
      const distance = calculateDistanceKm(
        caceresCenter.latitude,
        caceresCenter.longitude,
        caceresCenter.latitude,
        caceresCenter.longitude
      );
      expect(distance).toBe(0);
    });

    it('deve calcular distância correta entre Centro de Cáceres e UNEMAT (~0.75 km)', () => {
      const distance = calculateDistanceKm(
        caceresCenter.latitude,
        caceresCenter.longitude,
        unematCampus.latitude,
        unematCampus.longitude
      );
      expect(distance).toBeGreaterThan(0.5);
      expect(distance).toBeLessThan(1.2);
    });

    it('deve lidar com coordenadas padrão ou zero de forma resiliente', () => {
      const distance = calculateDistanceKm(0, 0, 0, 0);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('deve formatar valores menores que 1 km em metros', () => {
      expect(formatDistance(0.45)).toBe('450 m');
      expect(formatDistance(0.05)).toBe('50 m');
    });

    it('deve formatar valores maiores ou iguais a 1 km em km com 1 casa decimal', () => {
      expect(formatDistance(1.23)).toBe('1.2 km');
      expect(formatDistance(15.89)).toBe('15.9 km');
    });
  });

  describe('sortItemsByDistance', () => {
    const items = [
      { id: '1', name: 'Distante', latitude: -16.15, longitude: -57.75 },
      { id: '2', name: 'Perto', latitude: -16.075, longitude: -57.679 },
      { id: '3', name: 'Médio', latitude: -16.09, longitude: -57.70 },
    ];

    it('deve ordenar itens por proximidade em relação à localização do usuário', () => {
      const sorted = sortItemsByDistance(items, caceresCenter.latitude, caceresCenter.longitude);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('deve manter ordem original se coordenadas do usuário forem inválidas', () => {
      const sorted = sortItemsByDistance(items, undefined as any, undefined as any);
      expect(sorted).toEqual(items);
    });
  });

  describe('getGoogleMapsNavigationUrl e getWazeNavigationUrl', () => {
    it('deve gerar URLs de navegação corretas para coordenadas válidas', () => {
      const gmaps = getGoogleMapsNavigationUrl(caceresCenter.latitude, caceresCenter.longitude);
      expect(gmaps).toContain('google.com/maps/dir/?api=1&destination=-16.0744,-57.6789');

      const waze = getWazeNavigationUrl(caceresCenter.latitude, caceresCenter.longitude);
      expect(waze).toContain('waze.com/ul?ll=-16.0744,-57.6789&navigate=yes');
    });
  });
});
