import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ExerciseStatePanelProps = {
  title: string;
  description: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  accessibilityRole?: 'alert' | 'summary';
};

export function ExerciseStatePanel({
  title,
  description,
  loading = false,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  accessibilityRole = 'summary',
}: ExerciseStatePanelProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      accessibilityRole={accessibilityRole}
      accessibilityLiveRegion="polite"
      style={[styles.panel, { borderColor: theme.border }]}>
      {loading && <ActivityIndicator color={theme.accent} size="small" />}
      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{description}</ThemedText>
      </View>
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <ActionButton label={actionLabel} onPress={onAction} primary />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <ActionButton label={secondaryActionLabel} onPress={onSecondaryAction} />
          )}
        </View>
      )}
    </ThemedView>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  primary?: boolean;
};

export function ActionButton({ label, onPress, primary = false }: ActionButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? theme.backgroundSelected : theme.background,
          borderColor: primary ? theme.accent : theme.border,
        },
        pressed && styles.pressed,
      ]}>
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
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
