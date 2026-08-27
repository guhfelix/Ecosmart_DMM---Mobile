import React from 'react';
import { render } from '@testing-library/react-native';
import { AppCard } from '../AppCard';

describe('AppCard Component', () => {
  it('deve renderizar título e descrição corretamente', () => {
    const { getByTestId, getByText } = render(
      <AppCard title="Título do Card" description="Descrição detalhada do card." />
    );

    expect(getByTestId('app-card')).toBeTruthy();
    expect(getByText('Título do Card')).toBeTruthy();
    expect(getByText('Descrição detalhada do card.')).toBeTruthy();
  });
});
