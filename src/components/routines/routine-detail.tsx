import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoutineActionButton } from '@/components/routines/routine-state-panel';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { formatExerciseEquipment } from '@/features/exercises/exercise-types';
import type {
  ProjectedRoutineExercise,
  RoutineExerciseProjectionState,
} from '@/features/routines/use-routine-data';
import {
  getRoutineFocusLabel,
  getRoutineLevelLabel,
  getRoutineOwnershipLabel,
  type Routine,
} from '@/features/routines/routine-types';
import { useTheme } from '@/hooks/use-theme';

type RoutineDetailProps = {
  routine: Routine;
  exerciseState: RoutineExerciseProjectionState;
  onRetryExercises: () => void;
  copyPending: boolean;
  copyError: Error | null;
  onCopy: () => void;
};

export function RoutineDetail({
  routine,
  exerciseState,
  onRetryExercises,
  copyPending,
  copyError,
  onCopy,
}: RoutineDetailProps) {
  const theme = useTheme();
  const ownershipLabel = getRoutineOwnershipLabel(routine.ownership);

  return (
    <SectionScreen
      eyebrow="Training plan"
      title={routine.name}
      description={routine.description}
      hasNavigationHeader>
      <View style={styles.metadata}>
        <MetadataBadge label={ownershipLabel} accessibilityLabel={`${ownershipLabel} ownership`} />
        <MetadataBadge label={getRoutineFocusLabel(routine.focus)} />
        <MetadataBadge label={getRoutineLevelLabel(routine.level)} />
        {routine.estimatedDurationMinutes !== undefined && (
          <MetadataBadge label={`${routine.estimatedDurationMinutes} min estimate`} />
        )}
      </View>

      {routine.ownership === 'user' && routine.sourceRoutineId !== undefined && (
        <ThemedView
          type="backgroundElement"
          accessibilityRole="summary"
          style={[styles.provenance, { borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Source routine
          </ThemedText>
          <ThemedText type="smallBold">{routine.sourceRoutineId}</ThemedText>
        </ThemedView>
      )}

      {routine.ownership === 'default' && (
        <ThemedView
          type="backgroundElement"
          style={[styles.copyPanel, { borderColor: theme.border }]}>
          <View style={styles.copyText}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Make it yours
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Save an independent user copy on this device. The bundled default stays unchanged.
            </ThemedText>
          </View>
          <RoutineActionButton
            label={copyPending ? 'Copying routine' : 'Copy routine'}
            onPress={onCopy}
            primary
            disabled={copyPending}
            busy={copyPending}
          />
          {copyError && (
            <ThemedText accessibilityRole="alert" accessibilityLiveRegion="polite" themeColor="text">
              Copy failed: {copyError.message}. Try again.
            </ThemedText>
          )}
        </ThemedView>
      )}

      <View style={styles.exerciseSection}>
        <View style={styles.sectionHeading}>
          <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
            Ordered prescription
          </ThemedText>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {routine.exercises.length} exercises
          </ThemedText>
        </View>

        {exerciseState.status === 'loading' && (
          <ProjectionPanel
            title="Loading exercise details"
            description="Resolving canonical exercise names and equipment for this routine."
          />
        )}
        {exerciseState.status === 'error' && (
          <ProjectionPanel
            title="Exercise details unavailable"
            description="The routine is available, but its exercise metadata could not be loaded."
            onRetry={onRetryExercises}
            alert
          />
        )}
        {exerciseState.status === 'missing-reference' && (
          <ProjectionPanel
            title="Exercise reference unavailable"
            description={`No canonical exercise was found for: ${exerciseState.exerciseIds.join(', ')}.`}
            onRetry={onRetryExercises}
            alert
          />
        )}
        {exerciseState.status === 'success' && (
          <View accessibilityRole="list" style={styles.exerciseList}>
            {exerciseState.data.map((projection) => (
              <RoutineExerciseRow key={projection.routineExercise.id} projection={projection} />
            ))}
          </View>
        )}
      </View>
    </SectionScreen>
  );
}

function MetadataBadge({ label, accessibilityLabel }: { label: string; accessibilityLabel?: string }) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      accessibilityLabel={accessibilityLabel}
      style={[styles.metadataItem, { borderColor: theme.border }]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </ThemedView>
  );
}

function ProjectionPanel({
  title,
  description,
  onRetry,
  alert = false,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  alert?: boolean;
}) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      accessibilityRole={alert ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
      style={[styles.projectionPanel, { borderColor: theme.border }]}>
      <View style={styles.copyText}>
        <ThemedText type="subtitle" style={styles.projectionTitle}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{description}</ThemedText>
      </View>
      {onRetry && <RoutineActionButton label="Retry exercise details" onPress={onRetry} primary />}
    </ThemedView>
  );
}

function RoutineExerciseRow({ projection }: { projection: ProjectedRoutineExercise }) {
  const theme = useTheme();
  const { exercise, routineExercise } = projection;
  const prescription =
    routineExercise.prescriptionType === 'reps'
      ? `${routineExercise.sets} sets x ${routineExercise.targetReps} reps`
      : `${routineExercise.sets} sets x ${routineExercise.targetDurationSeconds} seconds`;
  const accessibilityDescription = [
    prescription,
    routineExercise.restSeconds === undefined
      ? null
      : `${routineExercise.restSeconds} seconds rest`,
    routineExercise.notes ?? null,
  ]
    .filter((value): value is string => value !== null)
    .join('. ');

  return (
    <Link
      href={{
        pathname: '/exercises/[exerciseId]',
        params: { exerciseId: routineExercise.exerciseId },
      }}
      asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${routineExercise.order}. ${exercise.name}. ${accessibilityDescription}.`}
        accessibilityHint="Opens the existing exercise guide"
        style={({ pressed }) => [
          styles.exerciseRow,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="code" themeColor="accent" style={styles.order}>
          {String(routineExercise.order).padStart(2, '0')}
        </ThemedText>
        <View style={styles.exerciseCopy}>
          <ThemedText type="subtitle" style={styles.exerciseName}>
            {exercise.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {formatExerciseEquipment(exercise.equipmentIds)}
          </ThemedText>
          <ThemedText type="smallBold">{prescription}</ThemedText>
          {routineExercise.restSeconds !== undefined && (
            <ThemedText type="small">Rest: {routineExercise.restSeconds} seconds</ThemedText>
          )}
          {routineExercise.notes !== undefined && (
            <ThemedText type="small" themeColor="textSecondary">
              Notes: {routineExercise.notes}
            </ThemedText>
          )}
          <ThemedText type="smallBold" themeColor="accent">
            View exercise
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metadataItem: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  provenance: {
    alignItems: 'flex-start',
    gap: Spacing.one,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  copyPanel: {
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  copyText: {
    maxWidth: 620,
    gap: Spacing.two,
  },
  exerciseSection: {
    gap: Spacing.three,
  },
  sectionHeading: {
    gap: Spacing.one,
  },
  eyebrow: {
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 35,
  },
  projectionPanel: {
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  projectionTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  exerciseList: {
    gap: Spacing.three,
  },
  exerciseRow: {
    minHeight: 160,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.72,
  },
  order: {
    width: 28,
    paddingTop: Spacing.two,
  },
  exerciseCopy: {
    flex: 1,
    gap: Spacing.two,
  },
  exerciseName: {
    fontSize: 24,
    lineHeight: 30,
  },
});
