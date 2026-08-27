import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppNotification } from '../models';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
};

export function NotificationModal({
  visible,
  notifications,
  onClose,
  onMarkAllAsRead,
}: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'discard':
        return '♻️';
      case 'collection':
        return '🚚';
      case 'sync':
        return '🔄';
      default:
        return '🔔';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notificações</Text>
            <Text style={styles.subtitle}>Alertas e atualizações do ecossistema</Text>
          </View>
          <Pressable style={styles.closeHeaderButton} onPress={onClose}>
            <Text style={styles.closeHeaderButtonText}>✕</Text>
          </Pressable>
        </View>

        {notifications.length > 0 ? (
          <View style={styles.actionsBar}>
            <Pressable style={styles.markReadButton} onPress={onMarkAllAsRead}>
              <Text style={styles.markReadButtonText}>Marcar todas como lidas</Text>
            </Pressable>
          </View>
        ) : null}

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Você não possui nenhuma notificação no momento.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.cardUnread]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardIcon}>{getIcon(item.type)}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                {!item.read ? <View style={styles.unreadBadge} /> : null}
              </View>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          )}
        />

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fechar</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#E8F5E9',
    fontSize: 13,
    marginTop: 4,
  },
  closeHeaderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeHeaderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  markReadButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  markReadButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    backgroundColor: '#FAFAFA',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  cardMessage: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    color: colors.muted,
    fontSize: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
});
