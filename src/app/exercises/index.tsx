import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ExerciseCard } from '@/components/exercises/exercise-card';
import { ExerciseFilters } from '@/components/exercises/exercise-filters';
import { ExerciseStatePanel } from '@/components/exercises/exercise-state-panel';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { filterExercises } from '@/features/exercises/filter-exercises';
import { useExerciseSession } from '@/features/exercises/exercise-session';
import { useExerciseList } from '@/features/exercises/use-exercise-data';

export default function ExercisesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const session = useExerciseSession();
  const { state, retry } = useExerciseList(session.repository);

  const filteredExercises =
    state.status === 'success'
      ? filterExercises(state.data, {
          searchText: session.searchText,
          bodyArea: session.bodyArea,
          difficulty: session.difficulty,
        })
      : [];
  const useWideCards = width >= 760;

  return (
    <SectionScreen
      eyebrow="Movement library"
      title="Exercises"
      description="Search a focused movement library, refine it by training area and difficulty, then open a guide for details and playback.">
      {state.status === 'loading' && (
        <ExerciseStatePanel
          title="Loading exercise library"
          description="Preparing the local development catalog."
          loading
        />
      )}

      {state.status === 'error' && (
        <ExerciseStatePanel
          title="Exercise library unavailable"
          description="The exercise data could not be loaded. Try the repository request again."
          actionLabel="Retry library"
          onAction={retry}
          accessibilityRole="alert"
        />
      )}

      {state.status === 'success' && (
        <>
          <ExerciseFilters
            searchText={session.searchText}
            onSearchTextChange={session.setSearchText}
            bodyArea={session.bodyArea}
            onBodyAreaChange={session.setBodyArea}
            difficulty={session.difficulty}
            onDifficultyChange={session.setDifficulty}
          />

          <View style={styles.resultsHeading}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Showing {filteredExercises.length} of {state.data.length} exercises
            </ThemedText>
          </View>

          {filteredExercises.length === 0 ? (
            <ExerciseStatePanel
              title="No exercises found"
              description="No exercise matches every active search and filter. Reset them to see the full library."
              actionLabel="Reset search and filters"
              onAction={session.resetDiscovery}
            />
          ) : (
            <View style={styles.cards}>
              {filteredExercises.map((exercise) => (
                <View
                  key={exercise.id}
                  style={[styles.cardSlot, useWideCards && styles.cardSlotWide]}>
                  <ExerciseCard
                    exercise={exercise}
                    onPress={() =>
                      router.push({
                        pathname: '/exercises/[exerciseId]',
                        params: { exerciseId: exercise.id },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </SectionScreen>
  );
}

const styles = StyleSheet.create({
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  cardSlot: {
    width: '100%',
  },
  cardSlotWide: {
    width: '48%',
    flexGrow: 1,
  },
});
