import React from 'react';
import { render } from '@testing-library/react-native';
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
});
