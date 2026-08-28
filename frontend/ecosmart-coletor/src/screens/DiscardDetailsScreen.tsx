import React from 'react';
import {
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { CollectorDiscard } from '../data/mockData';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';
import { formatDistance } from '../utils/geoUtils';

type Props = {
  item: CollectorDiscard;
  onCollect: (id: string) => void;
  onBack: () => void;
  isOffline?: boolean;
};

export function DiscardDetailsScreen({ item, onCollect, onBack, isOffline = false }: Props) {
  const handleCollect = () => {
    if (isOffline) {
      Alert.alert(
        'Modo Offline',
        'Você está offline. A coleta foi registrada localmente no dispositivo e será sincronizada quando houver conexão.'
      );
    }
    onCollect(item.id);
  };

  const handleStartRoute = () => {
    Alert.alert(
      '🗺️ Navegação GPS',
      `Traçando melhor trajeto até: ${item.address} (${item.neighborhood}). Distância estimada: ${
        item.distanceKm ? formatDistance(item.distanceKm) : '1.4 km'
      }.`
    );
  };

  const isCollected = item.status === 'coletado';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Detalhes do descarte"
        subtitle="Confira dados e rota antes da coleta."
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.wasteType}>{item.wasteType}</Text>
            <View style={styles.badgesRow}>
              {item.distanceKm ? (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>📍 {formatDistance(item.distanceKm)}</Text>
                </View>
              ) : null}
              <Text style={[styles.status, isCollected ? styles.statusDone : styles.statusPending]}>
                {isCollected ? 'Coletado' : 'Pendente'}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>Quantidade</Text>
          <Text style={styles.value}>{item.quantity}</Text>

          <Text style={styles.label}>Cidadão</Text>
          <Text style={styles.value}>{item.citizenName}</Text>

          {item.cep ? (
            <>
              <Text style={styles.label}>CEP</Text>
              <Text style={styles.value}>{item.cep}</Text>
            </>
          ) : null}

          <Text style={styles.label}>Endereço e Bairro</Text>
          <Text style={styles.value}>{item.address}</Text>
          <Text style={styles.valueMuted}>{item.neighborhood} - {item.city || 'Cáceres'}/MT</Text>

          {item.latitude && item.longitude ? (
            <Text style={styles.gpsInfo}>
              📍 Cáceres/MT: Lat {item.latitude.toFixed(4)}, Lon {item.longitude.toFixed(4)}
            </Text>
          ) : null}

          <Pressable style={styles.routeButton} onPress={handleStartRoute}>
            <Text style={styles.routeButtonText}>🗺️ Iniciar Navegação / Ver Rota GPS</Text>
          </Pressable>

          <Text style={styles.label}>Data do registro</Text>
          <Text style={styles.value}>{item.createdAt}</Text>

          {item.collectedAt ? (
            <>
              <Text style={styles.label}>Data da coleta</Text>
              <Text style={styles.value}>{item.collectedAt}</Text>
            </>
          ) : null}

          {item.observation ? (
            <>
              <Text style={styles.label}>Observação</Text>
              <Text style={styles.observation}>{item.observation}</Text>
            </>
          ) : null}

          {!isCollected ? (
            <PrimaryButton
              title="Confirmar coleta"
              onPress={handleCollect}
              testID="collect-button"
              style={styles.primaryButton}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    color: colors.primarySoft,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  wasteType: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceBadgeText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '800',
  },
  statusPending: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
  },
  statusDone: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  photoContainer: {
    marginBottom: 12,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  label: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 16,
  },
  valueMuted: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  gpsInfo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
  },
  routeButton: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  routeButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  observation: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 22,
  },
});
