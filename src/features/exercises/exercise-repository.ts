import { LOCAL_EXERCISES } from '@/features/exercises/exercise-catalog';
import type { Exercise } from '@/features/exercises/exercise-types';

export interface ExerciseRepository {
  listExercises(): Promise<readonly Exercise[]>;
  getExerciseById(id: string): Promise<Exercise | null>;
}

class LocalExerciseRepository implements ExerciseRepository {
  listExercises(): Promise<readonly Exercise[]> {
    return Promise.resolve(LOCAL_EXERCISES);
  }

  getExerciseById(id: string): Promise<Exercise | null> {
    return Promise.resolve(LOCAL_EXERCISES.find((exercise) => exercise.id === id) ?? null);
  }
}

export const localExerciseRepository: ExerciseRepository = new LocalExerciseRepository();
