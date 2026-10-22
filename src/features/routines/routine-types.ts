export type RoutineOwnership = 'default' | 'user';

export type RoutineFocus =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'full-body';

export type RoutineLevel = 'beginner' | 'intermediate' | 'advanced' | 'experienced';
export type RoutineFocusFilter = RoutineFocus | 'All';
export type RoutineLevelFilter = RoutineLevel | 'All';

type RoutineTaxonomyEntry = {
  readonly label: string;
};

export const ROUTINE_OWNERSHIPS = {
  default: { label: 'Default' },
  user: { label: 'User' },
} as const satisfies Record<RoutineOwnership, RoutineTaxonomyEntry>;

export const ROUTINE_FOCUSES = {
  chest: { label: 'Chest' },
  back: { label: 'Back' },
  shoulders: { label: 'Shoulders' },
  biceps: { label: 'Biceps' },
  triceps: { label: 'Triceps' },
  legs: { label: 'Legs' },
  glutes: { label: 'Glutes' },
  core: { label: 'Core' },
  'full-body': { label: 'Full Body' },
} as const satisfies Record<RoutineFocus, RoutineTaxonomyEntry>;

export const ROUTINE_LEVELS = {
  beginner: { label: 'Beginner' },
  intermediate: { label: 'Intermediate' },
  advanced: { label: 'Advanced' },
  experienced: { label: 'Experienced' },
} as const satisfies Record<RoutineLevel, RoutineTaxonomyEntry>;

export const ROUTINE_FOCUS_FILTERS = [
  'All',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'full-body',
] as const satisfies readonly RoutineFocusFilter[];

export const ROUTINE_LEVEL_FILTERS = [
  'All',
  'beginner',
  'intermediate',
  'advanced',
  'experienced',
] as const satisfies readonly RoutineLevelFilter[];

export type RoutineExerciseBase = {
  id: string;
  order: number;
  exerciseId: string;
  sets: number;
  restSeconds?: number;
  notes?: string;
};

export type RepsRoutineExercise = RoutineExerciseBase & {
  prescriptionType: 'reps';
  targetReps: number;
  targetDurationSeconds?: never;
};

export type TimedRoutineExercise = RoutineExerciseBase & {
  prescriptionType: 'timed';
  targetDurationSeconds: number;
  targetReps?: never;
};

export type RoutineExercise = RepsRoutineExercise | TimedRoutineExercise;

export type RoutineBase = {
  id: string;
  name: string;
  description: string;
  focus: RoutineFocus;
  level: RoutineLevel;
  estimatedDurationMinutes?: number;
  exercises: RoutineExercise[];
};

export type DefaultRoutine = RoutineBase & {
  ownership: 'default';
  createdAt?: never;
  updatedAt?: never;
  sourceRoutineId?: never;
};

export type UserRoutine = RoutineBase & {
  ownership: 'user';
  createdAt: string;
  updatedAt: string;
  sourceRoutineId?: string;
};

export type Routine = DefaultRoutine | UserRoutine;

export type RoutineFilters = {
  focus: RoutineFocusFilter;
  level: RoutineLevelFilter;
};

const ROUTINE_FOCUS_VALUES = new Set<string>(Object.keys(ROUTINE_FOCUSES));
const ROUTINE_LEVEL_VALUES = new Set<string>(Object.keys(ROUTINE_LEVELS));
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactProperties(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const allowed = new Set([...required, ...optional]);
  const keys = Object.keys(value);

  return required.every((key) => Object.prototype.hasOwnProperty.call(value, key)) &&
    keys.every((key) => allowed.has(key));
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value > 0;
}

function isNonnegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
}

function isRoutineExercise(
  value: unknown,
  canonicalExerciseIds?: ReadonlySet<string>,
): value is RoutineExercise {
  if (!isRecord(value)) {
    return false;
  }

  const commonRequired = ['id', 'order', 'exerciseId', 'sets', 'prescriptionType'] as const;
  const commonOptional = ['restSeconds', 'notes'] as const;
  const isReps = value.prescriptionType === 'reps';
  const isTimed = value.prescriptionType === 'timed';

  if (!isReps && !isTimed) {
    return false;
  }

  const targetProperty = isReps ? 'targetReps' : 'targetDurationSeconds';
  if (!hasExactProperties(value, [...commonRequired, targetProperty], commonOptional)) {
    return false;
  }

  if (
    !isNonBlankString(value.id) ||
    !isPositiveInteger(value.order) ||
    !isNonBlankString(value.exerciseId) ||
    !isPositiveInteger(value.sets) ||
    !isPositiveInteger(value[targetProperty]) ||
    (canonicalExerciseIds !== undefined && !canonicalExerciseIds.has(value.exerciseId))
  ) {
    return false;
  }

  if (
    (Object.prototype.hasOwnProperty.call(value, 'restSeconds') &&
      !isNonnegativeInteger(value.restSeconds)) ||
    (Object.prototype.hasOwnProperty.call(value, 'notes') && !isNonBlankString(value.notes))
  ) {
    return false;
  }

  return true;
}

function hasValidRoutineBase(
  value: Record<string, unknown>,
  canonicalExerciseIds?: ReadonlySet<string>,
): boolean {
  if (
    !isNonBlankString(value.id) ||
    !isNonBlankString(value.name) ||
    !isNonBlankString(value.description) ||
    typeof value.focus !== 'string' ||
    !ROUTINE_FOCUS_VALUES.has(value.focus) ||
    typeof value.level !== 'string' ||
    !ROUTINE_LEVEL_VALUES.has(value.level) ||
    !Array.isArray(value.exercises) ||
    value.exercises.length === 0
  ) {
    return false;
  }

  if (
    Object.prototype.hasOwnProperty.call(value, 'estimatedDurationMinutes') &&
    !isPositiveInteger(value.estimatedDurationMinutes)
  ) {
    return false;
  }

  const entryIds = new Set<string>();
  for (const [index, exercise] of value.exercises.entries()) {
    if (
      !isRoutineExercise(exercise, canonicalExerciseIds) ||
      exercise.order !== index + 1 ||
      entryIds.has(exercise.id) ||
      exercise.id === value.id
    ) {
      return false;
    }
    entryIds.add(exercise.id);
  }

  return true;
}

export function isDefaultRoutine(
  value: unknown,
  canonicalExerciseIds?: ReadonlySet<string>,
): value is DefaultRoutine {
  if (!isRecord(value)) {
    return false;
  }

  const required = [
    'id',
    'name',
    'description',
    'focus',
    'level',
    'exercises',
    'ownership',
  ] as const;

  return hasExactProperties(value, required, ['estimatedDurationMinutes']) &&
    value.ownership === 'default' &&
    hasValidRoutineBase(value, canonicalExerciseIds);
}

export function isUserRoutine(
  value: unknown,
  canonicalExerciseIds?: ReadonlySet<string>,
): value is UserRoutine {
  if (!isRecord(value)) {
    return false;
  }

  const required = [
    'id',
    'name',
    'description',
    'focus',
    'level',
    'exercises',
    'ownership',
    'createdAt',
    'updatedAt',
  ] as const;

  return hasExactProperties(value, required, [
    'estimatedDurationMinutes',
    'sourceRoutineId',
  ]) &&
    value.ownership === 'user' &&
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt) &&
    (!Object.prototype.hasOwnProperty.call(value, 'sourceRoutineId') ||
      isNonBlankString(value.sourceRoutineId)) &&
    hasValidRoutineBase(value, canonicalExerciseIds);
}

export function getRoutineOwnershipLabel(ownership: RoutineOwnership): string {
  return ROUTINE_OWNERSHIPS[ownership].label;
}

export function getRoutineFocusLabel(focus: RoutineFocusFilter): string {
  return focus === 'All' ? focus : ROUTINE_FOCUSES[focus].label;
}

export function getRoutineLevelLabel(level: RoutineLevelFilter): string {
  return level === 'All' ? level : ROUTINE_LEVELS[level].label;
}
