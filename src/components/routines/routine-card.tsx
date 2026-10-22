import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  getRoutineFocusLabel,
  getRoutineLevelLabel,
  getRoutineOwnershipLabel,
  type Routine,
} from '@/features/routines/routine-types';
import { useTheme } from '@/hooks/use-theme';

type RoutineCardProps = {
  routine: Routine;
  onPress: () => void;
};

export function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const theme = useTheme();
  const focusLabel = getRoutineFocusLabel(routine.focus);
  const levelLabel = getRoutineLevelLabel(routine.level);
  const ownershipLabel = getRoutineOwnershipLabel(routine.ownership);
  const estimateLabel =
    routine.estimatedDurationMinutes === undefined
      ? ''
      : `, about ${routine.estimatedDurationMinutes} minutes`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${routine.name}. ${ownershipLabel} routine, ${focusLabel}, ${levelLabel}, ${routine.exercises.length} exercises${estimateLabel}.`}
      accessibilityHint="Opens the ordered routine prescription"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.topLine}>
        <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
          {focusLabel}
        </ThemedText>
        <ThemedView
          type={routine.ownership === 'user' ? 'backgroundSelected' : 'background'}
          accessibilityLabel={`${ownershipLabel} ownership`}
          style={[styles.ownership, { borderColor: theme.border }]}>
          <ThemedText type="code">{ownershipLabel}</ThemedText>
        </ThemedView>
      </View>

      <ThemedText type="subtitle" style={styles.title}>
        {routine.name}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>
        {routine.description}
      </ThemedText>

      <View style={styles.metadata}>
        <MetadataItem value={levelLabel} />
        <MetadataItem value={`${routine.exercises.length} exercises`} />
        {routine.estimatedDurationMinutes !== undefined && (
          <MetadataItem value={`${routine.estimatedDurationMinutes} min`} />
        )}
      </View>

      <ThemedText type="smallBold" themeColor="accent">
        View routine
      </ThemedText>
    </Pressable>
  );
}

function MetadataItem({ value }: { value: string }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="background"
      style={[styles.metadataItem, { borderColor: theme.border }]}>
      <ThemedText type="small">{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 330,
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  eyebrow: {
    flexShrink: 1,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ownership: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  description: {
    flexGrow: 1,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metadataItem: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
});
