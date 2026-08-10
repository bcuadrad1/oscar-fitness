import { StyleSheet, View } from 'react-native';

import { ExerciseVideo } from '@/components/exercises/exercise-video';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatExerciseEquipment,
  getExerciseDifficultyLabel,
  type Exercise,
} from '@/features/exercises/exercise-types';
import { useTheme } from '@/hooks/use-theme';

type ExerciseDetailProps = {
  exercise: Exercise;
};

export function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  const theme = useTheme();
  const difficultyLabel = getExerciseDifficultyLabel(exercise.difficulty);
  const equipmentLabel = formatExerciseEquipment(exercise.equipmentIds);

  return (
    <SectionScreen
      eyebrow="Movement guide"
      title={exercise.name}
      description={exercise.description}
      hasNavigationHeader>
      <View style={styles.metadata}>
        {[exercise.targetBodyArea, exercise.category, difficultyLabel, equipmentLabel].map(
          (item) => (
            <ThemedView
              key={item}
              type="backgroundElement"
              style={[styles.metadataItem, { borderColor: theme.border }]}>
              <ThemedText type="smallBold">{item}</ThemedText>
            </ThemedView>
          ),
        )}
      </View>

      <ExerciseVideo
        exerciseName={exercise.name}
        thumbnail={exercise.thumbnail}
        video={exercise.video}
      />

      <View style={styles.details}>
        <ThemedView
          type="backgroundElement"
          style={[styles.informationCard, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
            Exercise information
          </ThemedText>
          <View style={styles.informationRows}>
            <InformationRow label="Target body area" value={exercise.targetBodyArea} />
            <InformationRow label="Category" value={exercise.category} />
            <InformationRow label="Difficulty" value={difficultyLabel} />
            <InformationRow label="Equipment" value={equipmentLabel} />
          </View>
        </ThemedView>

        <ThemedView
          type="backgroundElement"
          style={[styles.instructionsCard, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
            How to perform
          </ThemedText>
          <ThemedText type="subtitle" style={styles.instructionsTitle}>
            Controlled movement, step by step
          </ThemedText>
          <View accessibilityRole="list" style={styles.instructions}>
            {exercise.instructions.map((instruction, index) => (
              <View accessibilityRole="text" key={instruction} style={styles.instruction}>
                <ThemedText type="code" themeColor="accent" style={styles.number}>
                  {String(index + 1).padStart(2, '0')}
                </ThemedText>
                <ThemedText style={styles.instructionText}>{instruction}</ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>
      </View>
    </SectionScreen>
  );
}

function InformationRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.informationRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.informationValue}>
        {value}
      </ThemedText>
    </View>
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
  details: {
    gap: Spacing.three,
  },
  informationCard: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  eyebrow: {
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  informationRows: {
    gap: Spacing.two,
  },
  informationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  informationValue: {
    flex: 1,
    textAlign: 'right',
  },
  instructionsCard: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  instructionsTitle: {
    maxWidth: 620,
    fontSize: 28,
    lineHeight: 35,
  },
  instructions: {
    gap: Spacing.three,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  number: {
    width: 28,
    paddingTop: Spacing.one,
  },
  instructionText: {
    flex: 1,
  },
});
