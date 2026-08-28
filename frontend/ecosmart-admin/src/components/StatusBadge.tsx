import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type Props = {
  label: string;
  variant?: Variant;
};

export function StatusBadge({ label, variant = 'neutral' }: Props) {
  return <Text style={[styles.badge, styles[variant]]}>{label}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  success: {
    backgroundColor: colors.successSoft,
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
  },
  info: {
    backgroundColor: colors.infoSoft,
    color: colors.info,
  },
  neutral: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },
});
