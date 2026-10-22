import { useEffect, useState } from 'react';

import type { ExerciseRepository } from '@/features/exercises/exercise-repository';
import type { Exercise } from '@/features/exercises/exercise-types';
import type { RoutineRepository } from '@/features/routines/routine-repository';
import type { Routine, RoutineExercise } from '@/features/routines/routine-types';

export type RoutineDataState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export type ProjectedRoutineExercise = {
  routineExercise: RoutineExercise;
  exercise: Exercise;
};

export type RoutineExerciseProjectionState =
  | { status: 'loading' }
  | { status: 'success'; data: readonly ProjectedRoutineExercise[] }
  | { status: 'missing-reference'; exerciseIds: readonly string[] }
  | { status: 'error'; error: Error };

function toError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback);
}

export function useRoutineList(repository: RoutineRepository, revision: number) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState<{
    repository: RoutineRepository;
    requestVersion: number;
    revision: number;
    state: RoutineDataState<readonly Routine[]>;
  }>({ repository, requestVersion, revision, state: { status: 'loading' } });

  useEffect(() => {
    let isActive = true;

    repository.listRoutines().then(
      (routines) => {
        if (isActive) {
          setResult({
            repository,
            requestVersion,
            revision,
            state: { status: 'success', data: routines },
          });
        }
      },
      (error: unknown) => {
        if (isActive) {
          setResult({
            repository,
            requestVersion,
            revision,
            state: {
              status: 'error',
              error: toError(error, 'Routine data could not be loaded.'),
            },
          });
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, [repository, requestVersion, revision]);

  function retry() {
    setRequestVersion((version) => version + 1);
  }

  const state =
    result.repository === repository &&
    result.requestVersion === requestVersion &&
    result.revision === revision
      ? result.state
      : ({ status: 'loading' } as const);

  return { state, retry };
}

export function useRoutineDetail(
  repository: RoutineRepository,
  routineId: string | undefined,
  revision: number,
) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState<{
    repository: RoutineRepository;
    routineId: string | undefined;
    requestVersion: number;
    revision: number;
    state: RoutineDataState<Routine | null>;
  }>({ repository, routineId, requestVersion, revision, state: { status: 'loading' } });

  useEffect(() => {
    let isActive = true;
    const request = routineId ? repository.getRoutineById(routineId) : Promise.resolve(null);

    request.then(
      (routine) => {
        if (isActive) {
          setResult({
            repository,
            routineId,
            requestVersion,
            revision,
            state: { status: 'success', data: routine },
          });
        }
      },
      (error: unknown) => {
        if (isActive) {
          setResult({
            repository,
            routineId,
            requestVersion,
            revision,
            state: {
              status: 'error',
              error: toError(error, 'Routine data could not be loaded.'),
            },
          });
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, [repository, requestVersion, revision, routineId]);

  function retry() {
    setRequestVersion((version) => version + 1);
  }

  const state =
    result.repository === repository &&
    result.routineId === routineId &&
    result.requestVersion === requestVersion &&
    result.revision === revision
      ? result.state
      : ({ status: 'loading' } as const);

  return { state, retry };
}

export function useRoutineExerciseProjection(
  repository: ExerciseRepository,
  routine: Routine,
) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState<{
    repository: ExerciseRepository;
    routine: Routine;
    requestVersion: number;
    state: RoutineExerciseProjectionState;
  }>({ repository, routine, requestVersion, state: { status: 'loading' } });

  useEffect(() => {
    let isActive = true;
    const exerciseIds = [...new Set(routine.exercises.map((entry) => entry.exerciseId))];

    Promise.all(
      exerciseIds.map(async (exerciseId) => {
        const exercise = await repository.getExerciseById(exerciseId);
        return [exerciseId, exercise] as const;
      }),
    ).then(
      (resolvedExercises) => {
        if (!isActive) {
          return;
        }

        const exercisesById = new Map(resolvedExercises);
        const missingExerciseIds = resolvedExercises
          .filter(([, exercise]) => exercise === null)
          .map(([exerciseId]) => exerciseId);

        if (missingExerciseIds.length > 0) {
          setResult({
            repository,
            routine,
            requestVersion,
            state: { status: 'missing-reference', exerciseIds: missingExerciseIds },
          });
          return;
        }

        const projection = routine.exercises.map((routineExercise) => ({
          routineExercise,
          exercise: exercisesById.get(routineExercise.exerciseId) as Exercise,
        }));
        setResult({
          repository,
          routine,
          requestVersion,
          state: { status: 'success', data: projection },
        });
      },
      (error: unknown) => {
        if (isActive) {
          setResult({
            repository,
            routine,
            requestVersion,
            state: {
              status: 'error',
              error: toError(error, 'Exercise data could not be loaded.'),
            },
          });
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, [repository, requestVersion, routine]);

  function retry() {
    setRequestVersion((version) => version + 1);
  }

  const state =
    result.repository === repository &&
    result.routine === routine &&
    result.requestVersion === requestVersion
      ? result.state
      : ({ status: 'loading' } as const);

  return { state, retry };
}
