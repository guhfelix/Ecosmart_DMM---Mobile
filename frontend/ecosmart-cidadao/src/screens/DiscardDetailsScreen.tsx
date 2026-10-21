import React, { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { DiscardItem } from '../models';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';
import { validationUtils } from '../utils/validationUtils';

type Props = {
  item: DiscardItem;
  onEdit?: (item: DiscardItem) => void;
  onDelete?: (id: string) => void | Promise<void>;
  onBack: () => void;
};

export function DiscardDetailsScreen({ item, onEdit, onDelete, onBack }: Props) {
  const [deleting, setDeleting] = useState(false);
  const isDeletingRef = useRef(false);

  const isCollected = item.status === 'Coletado';
  const isOffline =
    item.status === 'Pendente (Offline)' || Boolean(item.offline || item.syncPending);

  const formattedQuantity = validationUtils.formatQuantityWithUnit(
    item.quantity,
    item.unit
  );

  const executeDelete = async () => {
    if (deleting || isDeletingRef.current || !onDelete) return;
    isDeletingRef.current = true;
    setDeleting(true);
    try {
      const res = onDelete(item.id);
      if (res && typeof (res as Promise<void>).then === 'function') {
        await res;
      }
    } finally {
      isDeletingRef.current = false;
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (deleting || isDeletingRef.current) return;
    Alert.alert(
      'Excluir descarte?',
      'Tem certeza que deseja excluir este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            executeDelete();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Detalhes do descarte"
        subtitle="Informações completas do registro."
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.title}>{item.type}</Text>
            <StatusBadge
              label={item.status}
              variant={isCollected ? 'success' : isOffline ? 'danger' : 'warning'}
            />
          </View>

          <InfoRow label="ID do Registro" value={item.id} />
          <InfoRow label="Categoria" value={item.type} />
          <InfoRow label="Quantidade" value={formattedQuantity} />
          {item.unit ? <InfoRow label="Unidade" value={item.unit} /> : null}
          <InfoRow label="Data" value={item.date} />
          <InfoRow
            label="Sincronização"
            value={
              isOffline
                ? 'Salvo localmente (offline)'
                : 'Sincronizado na nuvem'
            }
          />
          <InfoRow label="Status" value={item.status} />
          <InfoRow label="CEP" value={item.cep} />
          <InfoRow label="Endereço" value={item.address} />
          <InfoRow label="Número" value={item.numero || item.number} />
          <InfoRow label="Bairro" value={item.neighborhood} />
          <InfoRow label="Cidade" value={item.city} />

          {item.latitude && item.longitude ? (
            <InfoRow
              label="Coordenadas"
              value={`Lat ${item.latitude.toFixed(4)}, Lon ${item.longitude.toFixed(4)}`}
            />
          ) : null}

          <InfoRow label="Observação" value={item.observation} multiline />

          {onEdit && !isCollected ? (
            <PrimaryButton
              testID="edit-discard-button"
              title="Editar"
              variant="secondary"
              disabled={deleting}
              onPress={() => onEdit(item)}
              style={styles.editButton}
            />
          ) : null}

          {onDelete ? (
            <PrimaryButton
              testID="delete-discard-button"
              title="Excluir descarte"
              variant="danger"
              loading={deleting}
              disabled={deleting}
              onPress={confirmDelete}
              style={styles.deleteButton}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>{value}</Text>
    </View>
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: 11,
  },
  infoLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  infoValueMultiline: {
    color: colors.textSecondary,
  },
  editButton: {
    marginTop: spacing.md,
  },
  deleteButton: {
    marginTop: spacing.sm,
  },
});
