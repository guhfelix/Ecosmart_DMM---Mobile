import { AppNotification, NotificationType } from '../models';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Bem-vindo ao EcoSmart!',
    message: 'Seu ecossistema sustentável para gestão inteligente de resíduos.',
    date: 'Hoje, 09:00',
    read: false,
    type: 'system',
  },
  {
    id: 'notif-2',
    title: 'Dica de Sustentabilidade',
    message: 'Lave embalagens plásticas e desmonte caixas de papelão antes do descarte.',
    date: 'Hoje, 10:30',
    read: false,
    type: 'system',
  },
];

/**
 * Cria uma nova notificação no sistema.
 */
export function createNotification(
  title: string,
  message: string,
  type: NotificationType = 'system'
): AppNotification {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title,
    message,
    date: `Hoje, ${timeStr}`,
    read: false,
    type,
  };
}

/**
 * Marca uma notificação específica como lida.
 */
export function markNotificationAsRead(
  notifications: AppNotification[],
  id: string
): AppNotification[] {
  return notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

/**
 * Marca todas as notificações como lidas.
 */
export function markAllNotificationsAsRead(
  notifications: AppNotification[]
): AppNotification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}

/**
 * Conta quantas notificações não foram lidas.
 */
export function getUnreadNotificationCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}
