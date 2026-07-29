import { useLocalSearchParams, useRouter } from 'expo-router';

import { ExerciseDetail } from '@/components/exercises/exercise-detail';
import { ExerciseStatePanel } from '@/components/exercises/exercise-state-panel';
import { SectionScreen } from '@/components/section-screen';
import { localExerciseRepository } from '@/features/exercises/exercise-repository';
import { useExerciseSession } from '@/features/exercises/exercise-session';
import { useExerciseDetail } from '@/features/exercises/use-exercise-data';

export async function generateStaticParams() {
  const exercises = await localExerciseRepository.listExercises();
  return exercises.map((exercise) => ({ exerciseId: exercise.id }));
}

export default function ExerciseDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ exerciseId?: string | string[] }>();
  const exerciseId = Array.isArray(params.exerciseId) ? params.exerciseId[0] : params.exerciseId;
  const { repository } = useExerciseSession();
  const { state, retry } = useExerciseDetail(repository, exerciseId);

  function returnToLibrary() {
    router.replace('/exercises');
  }

  if (state.status === 'loading') {
    return (
      <SectionScreen
        eyebrow="Movement guide"
        title="Loading exercise"
        description="Resolving exercise details from the development repository."
        hasNavigationHeader>
        <ExerciseStatePanel
          title="Loading exercise detail"
          description="The exercise record is being prepared. Video loading begins only after it resolves."
          loading
        />
      </SectionScreen>
    );
  }

  if (state.status === 'error') {
    return (
      <SectionScreen
        eyebrow="Movement guide"
        title="Exercise unavailable"
        description="The exercise repository request did not complete."
        hasNavigationHeader>
        <ExerciseStatePanel
          title="Exercise data could not be loaded"
          description="Try the exercise request again or return to the library. No video player has been created."
          actionLabel="Retry exercise"
          onAction={retry}
          secondaryActionLabel="Back to exercises"
          onSecondaryAction={returnToLibrary}
          accessibilityRole="alert"
        />
      </SectionScreen>
    );
  }

  if (!state.data) {
    return (
      <SectionScreen
        eyebrow="Movement guide"
        title="Exercise not found"
        description="This exercise ID is not part of the current development catalog."
        hasNavigationHeader>
        <ExerciseStatePanel
          title="Return to the exercise library"
          description="Choose one of the available development exercises to open its guide."
          actionLabel="Back to exercises"
          onAction={returnToLibrary}
        />
      </SectionScreen>
    );
  }

  return <ExerciseDetail exercise={state.data} />;
}
