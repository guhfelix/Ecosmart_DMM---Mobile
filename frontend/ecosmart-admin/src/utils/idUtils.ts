/**
 * Utilitário de Geração de Identificadores Únicos Universais (UUID v4).
 * Substitui o uso de Date.now() para evitar colisões de chaves primárias em operações concorrentes e offline.
 */
export function generateUUID(): string {
  // Implementação compatível com React Native / Hermes / Node.js
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Gera um ID com prefixo semântico para entidades do ecossistema.
 * @param prefix Prefixo da entidade (ex: 'disc', 'user', 'point', 'tip', 'notif')
 */
export function generateEntityId(prefix: string): string {
  return `${prefix}-${generateUUID().substring(0, 8)}`;
}
