import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { crossAppSync } from '../services/crossAppSync';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isServerReachable?: boolean;
}

/**
 * Hook reativo de monitoramento de conectividade e saúde do servidor (Health Check com polling/backoff).
 * Combina eventos nativos do NetInfo com verificação ativa de conectividade da API REST (/api/health),
 * disparando reconexão automática assim que o servidor ou a rede voltarem a responder.
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isServerReachable: true,
  });

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      const netConnected = state.isConnected ?? true;
      const netReachable = state.isInternetReachable ?? true;
      const serverOk = netConnected ? await crossAppSync.checkServerHealth() : false;

      setStatus({
        isConnected: netConnected,
        isInternetReachable: netReachable,
        type: state.type,
        isServerReachable: serverOk,
      });

      return netConnected && netReachable !== false && serverOk;
    } catch (_err) {
      return false;
    }
  }, []);

  useEffect(() => {
    NetInfo.fetch()
      .then((state: NetInfoState) => {
        setStatus((prev) => ({
          ...prev,
          isConnected: state.isConnected ?? true,
          isInternetReachable: state.isInternetReachable ?? true,
          type: state.type,
        }));
      })
      .catch(() => {
        setStatus((prev) => ({
          ...prev,
          isConnected: true,
          isInternetReachable: true,
          type: 'fallback',
        }));
      });

    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const nextConnected = state.isConnected ?? true;
      const nextReachable = state.isInternetReachable ?? true;
      setStatus((prev) => ({
        ...prev,
        isConnected: nextConnected,
        isInternetReachable: nextReachable,
        type: state.type,
      }));

      // Ao detectar transição de rede para online, executa Health Check imediato
      if (nextConnected && nextReachable !== false) {
        crossAppSync.checkServerHealth().catch(() => {});
      }
    });

    const unsubscribeHealth = crossAppSync.onHealthChange((isHealthy) => {
      setStatus((prev) => ({
        ...prev,
        isServerReachable: isHealthy,
      }));
    });

    const stopPolling = crossAppSync.startHealthCheckPolling({
      baseIntervalMs: 3000,
      maxIntervalMs: 15000,
    });

    return () => {
      unsubscribeNetInfo();
      unsubscribeHealth();
      stopPolling();
    };
  }, []);

  const isOffline = status.isConnected === false || status.isInternetReachable === false;

  return {
    ...status,
    isOffline,
    checkConnection,
  };
}
