import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { DiscardItem } from './RegisterDiscardScreen';

type FilterType = 'todos' | 'pendente' | 'coletado' | 'offline';

type Props = {
  items: DiscardItem[];
  onDelete?: (id: string) => void;
  onBack: () => void;
};

export function HistoryScreen({ items, onDelete, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('todos');

  const filteredItems = useMemo(() => {
    let result = items;

    // Filtro por status
    if (statusFilter === 'pendente') {
      result = result.filter((i) => i.status === 'Pendente');
    } else if (statusFilter === 'coletado') {
      result = result.filter((i) => i.status === 'Coletado');
    } else if (statusFilter === 'offline') {
      result = result.filter((i) => i.status === 'Pendente (Offline)' || i.offline);
    }

    // Busca textual em tempo real
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.type.toLowerCase().includes(q) ||
          i.quantity.toLowerCase().includes(q) ||
          (i.observation && i.observation.toLowerCase().includes(q)) ||
          (i.neighborhood && i.neighborhood.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, statusFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Seus descartes registrados e status de coleta.</Text>
      </View>

      {/* Busca em tempo real */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar descartes por tipo, bairro..."
          placeholderTextColor={colors.muted}
        />
        {searchQuery ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Filtros por Chip */}
      <View style={styles.filterRow}>
        {(
          [
            { label: 'Todos', value: 'todos' },
            { label: 'Pendentes', value: 'pendente' },
            { label: 'Coletados', value: 'coletado' },
            { label: 'Offline', value: 'offline' },
          ] as const
        ).map((f) => (
          <Pressable
            key={f.value}
            style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === f.value && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum descarte encontrado com os filtros atuais.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          contentContainerStyle={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isOffline = item.status === 'Pendente (Offline)' || item.offline;
            const isDone = item.status === 'Coletado';

            return (
              <View style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemType}>{item.type}</Text>
                  <Text
                    style={[
                      styles.status,
                      isDone
                        ? styles.statusDone
                        : isOffline
                        ? styles.statusOffline
                        : styles.statusPending,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>

                <Text style={styles.itemMeta}>Quantidade: {item.quantity}</Text>
                <Text style={styles.itemMeta}>Data: {item.date}</Text>

                {item.cep ? (
                  <Text style={styles.itemMeta}>CEP: {item.cep}</Text>
                ) : null}

                {item.address ? (
                  <Text style={styles.itemMeta}>Endereço: {item.address}</Text>
                ) : null}

                {item.neighborhood ? (
                  <Text style={styles.itemMeta}>Bairro: {item.neighborhood} - {item.city || 'Cáceres'}/MT</Text>
                ) : null}

                {item.latitude && item.longitude ? (
                  <Text style={styles.gpsInfo}>
                    📍 Cáceres/MT: Lat {item.latitude.toFixed(4)}, Lon {item.longitude.toFixed(4)}
                  </Text>
                ) : null}

                {item.observation ? (
                  <Text style={styles.itemObservation}>{item.observation}</Text>
                ) : null}

                {onDelete ? (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        '🗑️ Excluir Descarte',
                        `Tem certeza que deseja apagar o registro de descarte de ${item.type}?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Sim, Excluir',
                            style: 'destructive',
                            onPress: () => onDelete(item.id),
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Apagar Descarte</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      )}

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  itemImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  statusOffline: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  statusDone: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  gpsInfo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 4,
  },
  itemObservation: {
    color: colors.text,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
