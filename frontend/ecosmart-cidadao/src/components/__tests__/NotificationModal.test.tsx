import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationModal } from '../NotificationModal';
import { AppNotification } from '../../models';

describe('NotificationModal Component', () => {
  const mockNotifications: AppNotification[] = [
    {
      id: '1',
      title: 'Coleta Realizada',
      message: 'Seu plástico foi coletado.',
      date: 'Hoje, 10:00',
      read: false,
      type: 'collection',
    },
    {
      id: '2',
      title: 'Sincronização Concluída',
      message: 'Descartes sincronizados.',
      date: 'Hoje, 11:00',
      read: true,
      type: 'sync',
    },
  ];

  it('deve renderizar a lista de notificações quando visível', () => {
    const onClose = jest.fn();
    const onMarkAllAsRead = jest.fn();

    const { getByText } = render(
      <NotificationModal
        visible={true}
        notifications={mockNotifications}
        onClose={onClose}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    expect(getByText('Notificações')).toBeTruthy();
    expect(getByText('Coleta Realizada')).toBeTruthy();
    expect(getByText('Sincronização Concluída')).toBeTruthy();
  });

  it('deve permitir marcar todas como lidas', () => {
    const onClose = jest.fn();
    const onMarkAllAsRead = jest.fn();

    const { getByText } = render(
      <NotificationModal
        visible={true}
        notifications={mockNotifications}
        onClose={onClose}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    fireEvent.press(getByText('Marcar todas como lidas'));
    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it('deve acionar onClose ao clicar em Fechar', () => {
    const onClose = jest.fn();
    const onMarkAllAsRead = jest.fn();

    const { getByText } = render(
      <NotificationModal
        visible={true}
        notifications={mockNotifications}
        onClose={onClose}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    fireEvent.press(getByText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve exibir mensagem de estado vazio quando não houver notificações', () => {
    const onClose = jest.fn();
    const onMarkAllAsRead = jest.fn();

    const { getByText } = render(
      <NotificationModal
        visible={true}
        notifications={[]}
        onClose={onClose}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    expect(getByText('Você não possui nenhuma notificação no momento.')).toBeTruthy();
  });
});
