import { useEffect, useState } from 'react';

import type { ExerciseRepository } from '@/features/exercises/exercise-repository';
import type { AsyncDataState, Exercise } from '@/features/exercises/exercise-types';

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('Exercise data could not be loaded.');
}

export function useExerciseList(repository: ExerciseRepository) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState<{
    repository: ExerciseRepository;
    requestVersion: number;
    state: AsyncDataState<readonly Exercise[]>;
  }>({ repository, requestVersion, state: { status: 'loading' } });

  useEffect(() => {
    let isActive = true;

    repository.listExercises().then(
      (exercises) => {
        if (isActive) {
          setResult({
            repository,
            requestVersion,
            state: { status: 'success', data: exercises },
          });
        }
      },
      (error: unknown) => {
        if (isActive) {
          setResult({
            repository,
            requestVersion,
            state: { status: 'error', error: toError(error) },
          });
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, [repository, requestVersion]);

  function retry() {
    setRequestVersion((version) => version + 1);
  }

  const state =
    result.repository === repository && result.requestVersion === requestVersion
      ? result.state
      : ({ status: 'loading' } as const);

  return { state, retry };
}

export function useExerciseDetail(repository: ExerciseRepository, exerciseId: string | undefined) {
  const [requestVersion, setRequestVersion] = useState(0);
  const [result, setResult] = useState<{
    repository: ExerciseRepository;
    exerciseId: string | undefined;
    requestVersion: number;
    state: AsyncDataState<Exercise | null>;
  }>({ repository, exerciseId, requestVersion, state: { status: 'loading' } });

  useEffect(() => {
    let isActive = true;
    const request = exerciseId ? repository.getExerciseById(exerciseId) : Promise.resolve(null);

    request.then(
      (exercise) => {
        if (isActive) {
          setResult({
            repository,
            exerciseId,
            requestVersion,
            state: { status: 'success', data: exercise },
          });
        }
      },
      (error: unknown) => {
        if (isActive) {
          setResult({
            repository,
            exerciseId,
            requestVersion,
            state: { status: 'error', error: toError(error) },
          });
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, [exerciseId, repository, requestVersion]);

  function retry() {
    setRequestVersion((version) => version + 1);
  }

  const state =
    result.repository === repository &&
    result.exerciseId === exerciseId &&
    result.requestVersion === requestVersion
      ? result.state
      : ({ status: 'loading' } as const);

  return { state, retry };
}
