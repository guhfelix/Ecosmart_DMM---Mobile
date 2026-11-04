import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';

describe('OfflineBanner Component', () => {
  it('deve renderizar o banner quando isOffline for true', () => {
    const { getByTestId, getByText } = render(
      <OfflineBanner isOffline={true} message="Sem conexão" />
    );
    expect(getByTestId('offline-banner')).toBeTruthy();
    expect(getByText('Sem conexão')).toBeTruthy();
  });

  it('deve não renderizar nada (null) quando isOffline for false', () => {
    const { queryByTestId } = render(
      <OfflineBanner isOffline={false} message="Sem conexão" />
    );
    expect(queryByTestId('offline-banner')).toBeNull();
  });

  it('deve exibir mensagem padrão se nenhuma mensagem for especificada', () => {
    const { getByText } = render(<OfflineBanner isOffline={true} />);
    expect(getByText(/Modo Offline: Alterações serão salvas localmente/i)).toBeTruthy();
  });

  it('deve exibir contador de registros pendentes quando pendingCount > 0', () => {
    const { getByTestId, getByText } = render(
      <OfflineBanner isOffline={true} pendingCount={2} />
    );
    expect(getByTestId('offline-pending-count')).toBeTruthy();
    expect(getByText(/2 registros salvos localmente aguardando sincronização/i)).toBeTruthy();
  });

  it('deve exibir aviso de servidor indisponível e botão de sincronizar quando houver pendências', () => {
    const onRetry = jest.fn();
    const { getByTestId, getByText } = render(
      <OfflineBanner
        isOffline={false}
        isServerReachable={false}
        pendingCount={1}
        onRetrySync={onRetry}
      />
    );
    expect(getByTestId('offline-banner')).toBeTruthy();
    expect(getByText(/Servidor indisponível no momento/i)).toBeTruthy();
    fireEvent.press(getByTestId('offline-retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

