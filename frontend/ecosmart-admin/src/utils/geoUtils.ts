/**
 * Utilitários de Geolocalização e Cálculo de Distâncias em Cáceres - MT.
 */

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** Coordenadas padrão da cidade de Cáceres - Mato Grosso */
export const DEFAULT_USER_COORDINATES: Coordinates = {
  latitude: -16.0766,
  longitude: -57.6816,
};

/**
 * Calcula a distância geográfica aproximada em quilômetros entre duas coordenadas usando a fórmula de Haversine.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(2));
}

/**
 * Formata uma distância em km para exibição amigável ao usuário (ex: '850 m' ou '1.4 km').
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Ordena uma lista de itens com coordenadas por proximidade em relação ao usuário.
 */
export function sortItemsByDistance<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  userLat?: number,
  userLng?: number
): T[] {
  if (userLat === undefined || userLng === undefined) {
    return items;
  }

  return [...items].sort((a, b) => {
    const distA =
      a.latitude !== undefined && a.longitude !== undefined
        ? calculateDistanceKm(userLat, userLng, a.latitude, a.longitude)
        : Infinity;
    const distB =
      b.latitude !== undefined && b.longitude !== undefined
        ? calculateDistanceKm(userLat, userLng, b.latitude, b.longitude)
        : Infinity;
    return distA - distB;
  });
}

/**
 * Gera URL de navegação para o Google Maps.
 */
export function getGoogleMapsNavigationUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/**
 * Gera URL de navegação para o Waze.
 */
export function getWazeNavigationUrl(latitude: number, longitude: number): string {
  return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
}

