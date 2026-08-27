import {
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  INITIAL_NOTIFICATIONS,
} from '../notificationService';

describe('notificationService (Central de Notificações)', () => {
  it('deve criar uma nova notificação com valores padrão corretos', () => {
    const notif = createNotification('Coleta Agendada', 'Coletor a caminho', 'collection');
    expect(notif.id).toMatch(/^notif-/);
    expect(notif.title).toBe('Coleta Agendada');
    expect(notif.message).toBe('Coletor a caminho');
    expect(notif.type).toBe('collection');
    expect(notif.read).toBe(false);
  });

  it('deve marcar uma notificação como lida', () => {
    const list = [...INITIAL_NOTIFICATIONS];
    const updated = markNotificationAsRead(list, 'notif-1');
    expect(updated.find((n) => n.id === 'notif-1')?.read).toBe(true);
    expect(updated.find((n) => n.id === 'notif-2')?.read).toBe(false);
  });

  it('deve marcar todas as notificações como lidas', () => {
    const list = [...INITIAL_NOTIFICATIONS];
    const updated = markAllNotificationsAsRead(list);
    expect(updated.every((n) => n.read)).toBe(true);
  });

  it('deve contar corretamente o total de notificações não lidas', () => {
    expect(getUnreadNotificationCount(INITIAL_NOTIFICATIONS)).toBe(2);
    const readList = markAllNotificationsAsRead(INITIAL_NOTIFICATIONS);
    expect(getUnreadNotificationCount(readList)).toBe(0);
  });
});
