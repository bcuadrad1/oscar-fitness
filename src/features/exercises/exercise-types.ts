import type { ImageProps } from 'expo-image';

export type ExerciseBodyArea = 'Lower body' | 'Chest / upper body';
export type ExerciseCategory = 'Strength';
export type ExerciseDifficulty = 'Beginner' | 'Intermediate';
export type ExerciseBodyAreaFilter = ExerciseBodyArea | 'All';
export type ExerciseDifficultyFilter = ExerciseDifficulty | 'All';

export type ExerciseThumbnail = {
  source: ImageProps['source'];
  alt: string;
};

export type ExerciseVideo = {
  uri: string;
  label: string;
  accessibilityLabel: string;
};

export type Exercise = {
  id: string;
  name: string;
  targetBodyArea: ExerciseBodyArea;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  equipment: string;
  description: string;
  instructions: readonly string[];
  thumbnail: ExerciseThumbnail;
  video: ExerciseVideo | null;
};

export type ExerciseFilters = {
  searchText: string;
  bodyArea: ExerciseBodyAreaFilter;
  difficulty: ExerciseDifficultyFilter;
};

export type AsyncDataState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export const EXERCISE_BODY_AREA_FILTERS = [
  'All',
  'Lower body',
  'Chest / upper body',
] as const satisfies readonly ExerciseBodyAreaFilter[];

export const EXERCISE_DIFFICULTY_FILTERS = [
  'All',
  'Beginner',
  'Intermediate',
] as const satisfies readonly ExerciseDifficultyFilter[];
