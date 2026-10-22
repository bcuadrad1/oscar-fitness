import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RoutineStatePanelProps = {
  title: string;
  description: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  accessibilityRole?: 'alert' | 'summary';
};

export function RoutineStatePanel({
  title,
  description,
  loading = false,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  accessibilityRole = 'summary',
}: RoutineStatePanelProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      accessibilityRole={accessibilityRole}
      accessibilityLiveRegion="polite"
      style={[styles.panel, { borderColor: theme.border }]}>
      {loading && <ActivityIndicator accessibilityLabel="Loading" color={theme.accent} size="small" />}
      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{description}</ThemedText>
      </View>
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <RoutineActionButton label={actionLabel} onPress={onAction} primary />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <RoutineActionButton label={secondaryActionLabel} onPress={onSecondaryAction} />
          )}
        </View>
      )}
    </ThemedView>
  );
}

type RoutineActionButtonProps = {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  busy?: boolean;
};

export function RoutineActionButton({
  label,
  onPress,
  primary = false,
  disabled = false,
  busy = false,
}: RoutineActionButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? theme.backgroundSelected : theme.background,
          borderColor: primary ? theme.accent : theme.border,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {busy && <ActivityIndicator color={theme.accent} size="small" />}
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  copy: {
    maxWidth: 620,
    gap: Spacing.two,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  button: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
});
