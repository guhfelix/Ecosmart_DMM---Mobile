import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';

type Variant = 'success' | 'info' | 'warning' | 'danger';

type Props = {
  message?: string | null;
  variant?: Variant;
  duration?: number;
  onHide?: () => void;
};

export function FeedbackMessage({
  message,
  variant = 'success',
  duration = 2600,
  onHide,
}: Props) {
  useEffect(() => {
    if (!message || !onHide) return undefined;
    const timeout = setTimeout(onHide, duration);
    return () => clearTimeout(timeout);
  }, [duration, message, onHide]);

  if (!message) return null;

  return (
    <View pointerEvents="none" style={[styles.container, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    zIndex: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successMuted,
  },
  info: {
    backgroundColor: colors.infoSoft,
    borderColor: colors.infoMuted,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningMuted,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerMuted,
  },
  successText: {
    color: colors.success,
  },
  infoText: {
    color: colors.info,
  },
  warningText: {
    color: colors.warning,
  },
  dangerText: {
    color: colors.danger,
  },
});
