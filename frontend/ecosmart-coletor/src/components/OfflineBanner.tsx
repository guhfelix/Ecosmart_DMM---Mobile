import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface OfflineBannerProps {
  /** Mensagem customizada a ser exibida no alerta */
  message?: string;
  /** Estado de conectividade da rede (se true, exibe a barra no topo) */
  isOffline?: boolean;
  /** Indica se o servidor de sincronização está acessível */
  isServerReachable?: boolean;
  /** Quantidade de itens/operações aguardando sincronização na fila local */
  pendingCount?: number;
  /** Indica se a sincronização automática está em andamento */
  isSyncing?: boolean;
  /** Callback opcional para forçar tentativa manual de sincronização */
  onRetrySync?: () => void;
}

/**
 * Banner superior de alerta visual de modo offline e status de sincronização.
 * Informa ao usuário com transparência quando a conexão com a internet ou servidor foi interrompida,
 * quantos registros estão salvos localmente aguardando envio e quando a sincronização ocorre.
 */
export function OfflineBanner({
  message = 'Modo Offline: Alterações serão salvas localmente no dispositivo.',
  isOffline = true,
  isServerReachable = true,
  pendingCount = 0,
  isSyncing = false,
  onRetrySync,
}: OfflineBannerProps) {
  const showServerWarning = !isOffline && isServerReachable === false && pendingCount > 0;
  const shouldRender = isOffline || showServerWarning || isSyncing;

  if (!shouldRender) return null;

  const displayMessage = isSyncing
    ? 'Sincronizando dados locais pendentes com a nuvem...'
    : isOffline
    ? message
    : 'Servidor indisponível no momento: seus dados estão salvos localmente e aguardam sincronização.';

  return (
    <View
      style={[
        styles.banner,
        isSyncing && styles.bannerSyncing,
        showServerWarning && !isOffline && styles.bannerServerWarning,
      ]}
      testID="offline-banner"
    >
      <Text style={styles.icon}>{isSyncing ? '🔄' : '⚠️'}</Text>
      <View style={styles.contentColumn}>
        <Text style={styles.text}>{displayMessage}</Text>
        {pendingCount > 0 ? (
          <Text style={styles.pendingText} testID="offline-pending-count">
            {pendingCount}{' '}
            {pendingCount === 1
              ? 'registro salvo localmente aguardando sincronização'
              : 'registros salvos localmente aguardando sincronização'}
          </Text>
        ) : null}
      </View>
      {onRetrySync && !isOffline && pendingCount > 0 && !isSyncing ? (
        <Pressable
          onPress={onRetrySync}
          style={styles.retryButton}
          testID="offline-retry-button"
        >
          <Text style={styles.retryButtonText}>Sincronizar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  bannerServerWarning: {
    backgroundColor: '#EF6C00',
  },
  bannerSyncing: {
    backgroundColor: '#1565C0',
  },
  icon: {
    fontSize: 16,
  },
  contentColumn: {
    flex: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingText: {
    color: '#FFF3E0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

