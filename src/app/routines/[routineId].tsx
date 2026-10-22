import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { RoutineDetail } from '@/components/routines/routine-detail';
import { RoutineStatePanel } from '@/components/routines/routine-state-panel';
import { SectionScreen } from '@/components/section-screen';
import { DEFAULT_ROUTINES } from '@/features/routines/routine-catalog';
import { useRoutineSession } from '@/features/routines/routine-session';
import type { Routine } from '@/features/routines/routine-types';
import {
  useRoutineDetail,
  useRoutineExerciseProjection,
} from '@/features/routines/use-routine-data';

export function generateStaticParams() {
  return DEFAULT_ROUTINES.map((routine) => ({ routineId: routine.id }));
}

export default function RoutineDetailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routineId?: string | string[] }>();
  const routineId = Array.isArray(params.routineId) ? params.routineId[0] : params.routineId;
  const session = useRoutineSession();
  const { state, retry } = useRoutineDetail(
    session.repository,
    routineId,
    session.revision,
  );

  function returnToLibrary() {
    router.replace('/routines');
  }

  if (state.status === 'loading') {
    return (
      <SectionScreen
        eyebrow="Training plan"
        title="Loading routine"
        description="Resolving the routine from bundled data and local storage."
        hasNavigationHeader>
        <RoutineStatePanel
          title="Loading routine detail"
          description="The exact routine record is being prepared."
          loading
        />
      </SectionScreen>
    );
  }

  if (state.status === 'error') {
    return (
      <SectionScreen
        eyebrow="Training plan"
        title="Routine unavailable"
        description="The routine repository request did not complete."
        hasNavigationHeader>
        <RoutineStatePanel
          title="Routine data could not be loaded"
          description="Try the routine request again or return to the library."
          actionLabel="Retry routine"
          onAction={retry}
          secondaryActionLabel="Back to routines"
          onSecondaryAction={returnToLibrary}
          accessibilityRole="alert"
        />
      </SectionScreen>
    );
  }

  if (!state.data) {
    return (
      <SectionScreen
        eyebrow="Training plan"
        title="Routine not found"
        description="This routine ID is not available in the bundled catalog or saved routines."
        hasNavigationHeader>
        <RoutineStatePanel
          title="Return to the routine library"
          description="Choose one of the available routines to open its prescription."
          actionLabel="Back to routines"
          onAction={returnToLibrary}
        />
      </SectionScreen>
    );
  }

  return <ResolvedRoutineDetail routine={state.data} />;
}

function ResolvedRoutineDetail({ routine }: { routine: Routine }) {
  const router = useRouter();
  const session = useRoutineSession();
  const { state: exerciseState, retry: retryExercises } = useRoutineExerciseProjection(
    session.exerciseRepository,
    routine,
  );
  const [copyPending, setCopyPending] = useState(false);
  const [copyError, setCopyError] = useState<Error | null>(null);
  const pendingCopy = useRef<Promise<Routine> | null>(null);

  async function copyRoutine() {
    if (routine.ownership !== 'default' || pendingCopy.current) {
      return;
    }

    setCopyError(null);
    setCopyPending(true);
    const request = session.copyDefaultRoutine(routine.id);
    pendingCopy.current = request;

    try {
      const copy = await request;
      router.replace({
        pathname: '/routines/[routineId]',
        params: { routineId: copy.id },
      } as unknown as Href);
    } catch (error: unknown) {
      setCopyError(error instanceof Error ? error : new Error('The routine could not be copied'));
    } finally {
      if (pendingCopy.current === request) {
        pendingCopy.current = null;
        setCopyPending(false);
      }
    }
  }

  return (
    <RoutineDetail
      routine={routine}
      exerciseState={exerciseState}
      onRetryExercises={retryExercises}
      copyPending={copyPending}
      copyError={copyError}
      onCopy={copyRoutine}
    />
  );
}
