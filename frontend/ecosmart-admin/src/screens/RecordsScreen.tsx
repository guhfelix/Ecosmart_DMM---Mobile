import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminDiscardRecord, AdminDiscardStatus } from '../data/mockData';
import { colors } from '../theme/colors';
import { generateCsvReport, generateSustainabilityMetrics } from '../services/reportService';

type RecordFilter = 'todos' | AdminDiscardStatus;

type Props = {
  items: AdminDiscardRecord[];
  selectedFilter: RecordFilter;
  onSelectFilter: (filter: RecordFilter) => void;
  onDelete?: (id: string) => void;
  onBack: () => void;
};

const filters: { label: string; value: RecordFilter }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Visualizados', value: 'visualizado' },
  { label: 'Coletados', value: 'coletado' },
];

export function RecordsScreen({ items, selectedFilter, onSelectFilter, onDelete, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const totalPending = items.filter((item) => item.status === 'pendente').length;
  const totalViewed = items.filter((item) => item.status === 'visualizado').length;
  const totalCollected = items.filter((item) => item.status === 'coletado').length;

  const filteredItems = useMemo(() => {
    let result = selectedFilter === 'todos' ? items : items.filter((item) => item.status === selectedFilter);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.citizenName.toLowerCase().includes(q) ||
          i.neighborhood.toLowerCase().includes(q) ||
          i.wasteType.toLowerCase().includes(q) ||
          (i.address && i.address.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedFilter, searchQuery]);

  const metrics = useMemo(() => generateSustainabilityMetrics(items), [items]);
  const csvData = useMemo(() => generateCsvReport(items), [items]);

  const handleCopyCsv = () => {
    Alert.alert('CSV Exportado', 'Os dados do relatório CSV estão prontos para visualização e cópia.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros gerais</Text>
        <Text style={styles.subtitle}>Acompanhe descartes e indicadores ESG do ecossistema.</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalPending}</Text>
          <Text style={styles.summaryLabel}>Pendentes</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalViewed}</Text>
          <Text style={styles.summaryLabel}>Visualizados</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalCollected}</Text>
          <Text style={styles.summaryLabel}>Coletados</Text>
        </View>
      </View>

      {/* Botão de Relatório ESG & Exportação */}
      <Pressable style={styles.reportButton} onPress={() => setShowReportModal(true)}>
        <Text style={styles.reportButtonText}>📊 Relatório ESG & Exportação (CSV)</Text>
      </Pressable>

      {/* Busca em tempo real */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar por cidadão, bairro, material..."
          placeholderTextColor={colors.muted}
        />
        {searchQuery ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            {filters.map((filter) => (
              <Pressable
                key={filter.value}
                style={[styles.filter, selectedFilter === filter.value && styles.filterSelected]}
                onPress={() => onSelectFilter(filter.value)}
              >
                <Text style={[styles.filterText, selectedFilter === filter.value && styles.filterTextSelected]}>
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum registro encontrado para este filtro.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.wasteType}</Text>
              <Text style={[styles.status, styles[`status_${item.status}`]]}>{statusLabel[item.status]}</Text>
            </View>

            <Text style={styles.cardText}>{item.quantity}</Text>
            {item.cep ? <Text style={styles.cardMeta}>CEP: {item.cep}</Text> : null}
            <Text style={styles.cardMeta}>{item.citizenName} • {item.neighborhood} - {item.city || 'Cáceres'}/MT</Text>
            {item.address ? <Text style={styles.cardAddress}>Endereço: {item.address}</Text> : null}
            <Text style={styles.cardFooter}>Registrado em {item.createdAt}</Text>

            {onDelete ? (
              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    '🗑️ Excluir Registro',
                    `Tem certeza que deseja apagar o registro de ${item.wasteType} do cidadão ${item.citizenName}?`,
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
                <Text style={styles.deleteButtonText}>🗑️ Apagar Registro</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        }
      />

      {/* Modal de Relatório ESG e Exportação CSV */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🌱 Relatório de Sustentabilidade ESG</Text>

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.esgCardsGrid}>
                <View style={styles.esgCard}>
                  <Text style={styles.esgValue}>{metrics.recyclingRate}%</Text>
                  <Text style={styles.esgLabel}>Taxa de Reciclagem</Text>
                </View>
                <View style={styles.esgCard}>
                  <Text style={styles.esgValue}>{metrics.estimatedCarbonAvoidedKg} kg</Text>
                  <Text style={styles.esgLabel}>CO₂ Evitado</Text>
                </View>
                <View style={styles.esgCard}>
                  <Text style={styles.esgValue}>{metrics.estimatedWaterSavedLiters} L</Text>
                  <Text style={styles.esgLabel}>Água Preservada</Text>
                </View>
                <View style={styles.esgCard}>
                  <Text style={styles.esgValue}>{metrics.totalCollected}</Text>
                  <Text style={styles.esgLabel}>Coletas Concluídas</Text>
                </View>
              </View>

              <Text style={styles.csvTitle}>Visualização de Dados (CSV):</Text>
              <TextInput
                style={styles.csvBox}
                value={csvData}
                multiline
                editable={false}
              />

              <Pressable style={styles.primaryButton} onPress={handleCopyCsv}>
                <Text style={styles.primaryButtonText}>📋 Exportar Relatório CSV</Text>
              </Pressable>
            </ScrollView>

            <Pressable style={styles.secondaryButton} onPress={() => setShowReportModal(false)}>
              <Text style={styles.secondaryButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const statusLabel: Record<AdminDiscardStatus, string> = {
  pendente: 'Pendente',
  visualizado: 'Visualizado',
  coletado: 'Coletado',
};

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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F3E5F5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  summary: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  summaryNumber: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  reportButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#2E7D32',
    fontWeight: '800',
    fontSize: 14,
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filter: {
    backgroundColor: '#F3E5F5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  status: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status_pendente: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  status_visualizado: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  status_coletado: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  cardPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardAddress: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  cardFooter: {
    color: colors.muted,
    fontSize: 13,
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
    padding: 28,
    alignItems: 'center',
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
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  esgCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  esgCard: {
    flexBasis: '48%',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  esgValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  esgLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  csvTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  csvBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    fontFamily: 'monospace',
    height: 120,
    color: colors.text,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});