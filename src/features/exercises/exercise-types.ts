import type { ImageProps } from 'expo-image';

export type ExerciseBodyArea = 'Lower body' | 'Chest / upper body';
export type ExerciseBodyAreaFilter = ExerciseBodyArea | 'All';
export type ExerciseDifficultyFilter = ExerciseDifficulty | 'All';

type ExerciseTaxonomyEntry = {
  readonly label: string;
};

export type ExerciseBodyPartId =
  | 'full-body'
  | 'neck'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'hip-flexors'
  | 'hip-adductors'
  | 'hip-abductors';

export const EXERCISE_BODY_PARTS = {
  'full-body': { label: 'Full Body' },
  neck: { label: 'Neck' },
  chest: { label: 'Chest' },
  back: { label: 'Back' },
  shoulders: { label: 'Shoulders' },
  biceps: { label: 'Biceps' },
  triceps: { label: 'Triceps' },
  forearms: { label: 'Forearms' },
  core: { label: 'Core' },
  glutes: { label: 'Glutes' },
  quadriceps: { label: 'Quadriceps' },
  hamstrings: { label: 'Hamstrings' },
  calves: { label: 'Calves' },
  'hip-flexors': { label: 'Hip Flexors' },
  'hip-adductors': { label: 'Hip Adductors' },
  'hip-abductors': { label: 'Hip Abductors' },
} as const satisfies Record<ExerciseBodyPartId, ExerciseTaxonomyEntry>;

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const EXERCISE_DIFFICULTIES = {
  beginner: { label: 'Beginner' },
  intermediate: { label: 'Intermediate' },
  advanced: { label: 'Advanced' },
} as const satisfies Record<ExerciseDifficulty, ExerciseTaxonomyEntry>;

export type ExerciseEquipmentId =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'cable'
  | 'machine'
  | 'smith-machine'
  | 'kettlebell'
  | 'resistance-band'
  | 'bench'
  | 'pull-up-dip-station'
  | 'other';

export const EXERCISE_EQUIPMENT = {
  bodyweight: { label: 'Bodyweight' },
  dumbbell: { label: 'Dumbbell' },
  barbell: { label: 'Barbell' },
  cable: { label: 'Cable' },
  machine: { label: 'Machine' },
  'smith-machine': { label: 'Smith machine' },
  kettlebell: { label: 'Kettlebell' },
  'resistance-band': { label: 'Resistance band' },
  bench: { label: 'Bench' },
  'pull-up-dip-station': { label: 'Pull-up / dip station' },
  other: { label: 'Other' },
} as const satisfies Record<ExerciseEquipmentId, ExerciseTaxonomyEntry>;

export type ExerciseEquipmentIds = readonly [ExerciseEquipmentId, ...ExerciseEquipmentId[]];

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
  targetBodyArea: string;
  category: string;
  primaryBodyPartId: ExerciseBodyPartId;
  secondaryBodyPartIds: readonly ExerciseBodyPartId[];
  difficulty: ExerciseDifficulty;
  equipmentIds: ExerciseEquipmentIds;
  description: string;
  instructions: readonly string[];
  thumbnail: ExerciseThumbnail;
  video: ExerciseVideo | null;
  progressionExerciseId?: string;
  regressionExerciseId?: string;
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
  'beginner',
  'intermediate',
  'advanced',
] as const satisfies readonly ExerciseDifficultyFilter[];

export function getExerciseBodyPartLabel(bodyPartId: ExerciseBodyPartId): string {
  return EXERCISE_BODY_PARTS[bodyPartId].label;
}

export function getExerciseDifficultyLabel(
  difficulty: ExerciseDifficultyFilter,
): string {
  return difficulty === 'All' ? difficulty : EXERCISE_DIFFICULTIES[difficulty].label;
}

export function getExerciseEquipmentLabel(equipmentId: ExerciseEquipmentId): string {
  return EXERCISE_EQUIPMENT[equipmentId].label;
}

export function formatExerciseEquipment(equipmentIds: ExerciseEquipmentIds): string {
  if (equipmentIds.length === 1 && equipmentIds[0] === 'bodyweight') {
    return 'Bodyweight / no equipment';
  }

  return equipmentIds.map(getExerciseEquipmentLabel).join(', ');
}

export function defineExerciseCatalog<const T extends readonly Exercise[]>(exercises: T): T {
  const exerciseIds = new Set<string>();

  for (const exercise of exercises) {
    if (exerciseIds.has(exercise.id)) {
      throw new Error(`Duplicate exercise ID: ${exercise.id}`);
    }
    exerciseIds.add(exercise.id);

    const secondaryBodyPartIds = new Set(exercise.secondaryBodyPartIds);
    if (secondaryBodyPartIds.size !== exercise.secondaryBodyPartIds.length) {
      throw new Error(`Duplicate secondary body part for exercise: ${exercise.id}`);
    }
    if (secondaryBodyPartIds.has(exercise.primaryBodyPartId)) {
      throw new Error(`Primary body part repeated as secondary for exercise: ${exercise.id}`);
    }

    if (new Set(exercise.equipmentIds).size !== exercise.equipmentIds.length) {
      throw new Error(`Duplicate equipment for exercise: ${exercise.id}`);
    }
  }

  for (const exercise of exercises) {
    for (const relatedExerciseId of [
      exercise.progressionExerciseId,
      exercise.regressionExerciseId,
    ]) {
      if (relatedExerciseId === undefined) {
        continue;
      }
      if (relatedExerciseId === exercise.id) {
        throw new Error(`Exercise relationship cannot reference itself: ${exercise.id}`);
      }
      if (!exerciseIds.has(relatedExerciseId)) {
        throw new Error(`Related exercise ID not found: ${relatedExerciseId}`);
      }
    }
  }

  return exercises;
}
