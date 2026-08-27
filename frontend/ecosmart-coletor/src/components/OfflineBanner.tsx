import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OfflineBannerProps {
  /** Mensagem customizada a ser exibida no alerta */
  message?: string;
  /** Estado de conectividade da rede (se true, exibe a barra no topo) */
  isOffline?: boolean;
}

/**
 * Banner superior de alerta visual de modo offline.
 * Informa ao usuário com transparência quando a conexão com a internet foi interrompida
 * e que as operações estão sendo preservadas localmente no dispositivo.
 */
export function OfflineBanner({
  message = 'Modo Offline: Alterações serão salvas localmente no dispositivo.',
  isOffline = true,
}: OfflineBannerProps) {
  if (!isOffline) return null;

  return (
    <View style={styles.banner} testID="offline-banner">
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
