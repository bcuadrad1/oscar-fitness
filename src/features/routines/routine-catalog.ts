import { LOCAL_EXERCISES } from '@/features/exercises/exercise-catalog';
import type { Exercise } from '@/features/exercises/exercise-types';
import {
  isDefaultRoutine,
  type DefaultRoutine,
  type RoutineFocus,
  type RoutineLevel,
} from '@/features/routines/routine-types';

const EXPECTED_ROUTINE_MATRIX = [
  ['chest-foundations', 'Chest Foundations', 'chest', 'beginner', 30, 4],
  ['balanced-chest-strength', 'Balanced Chest Strength', 'chest', 'intermediate', 35, 4],
  ['chest-strength-and-control', 'Chest Strength and Control', 'chest', 'advanced', 45, 4],
  ['back-foundations', 'Back Foundations', 'back', 'beginner', 35, 5],
  ['pull-and-row-balance', 'Pull and Row Balance', 'back', 'intermediate', 35, 4],
  ['back-strength-and-control', 'Back Strength and Control', 'back', 'advanced', 50, 5],
  ['shoulder-foundations', 'Shoulder Foundations', 'shoulders', 'beginner', 25, 4],
  [
    'balanced-shoulder-strength',
    'Balanced Shoulder Strength',
    'shoulders',
    'intermediate',
    35,
    4,
  ],
  ['biceps-basics', 'Biceps Basics', 'biceps', 'beginner', 20, 3],
  ['varied-curl-strength', 'Varied Curl Strength', 'biceps', 'intermediate', 30, 4],
  ['triceps-basics', 'Triceps Basics', 'triceps', 'beginner', 20, 3],
  [
    'triceps-press-and-extend',
    'Triceps Press and Extend',
    'triceps',
    'intermediate',
    30,
    4,
  ],
  ['leg-foundations', 'Leg Foundations', 'legs', 'beginner', 30, 4],
  ['balanced-leg-strength', 'Balanced Leg Strength', 'legs', 'intermediate', 45, 5],
  ['leg-strength-and-balance', 'Leg Strength and Balance', 'legs', 'advanced', 50, 5],
  ['glute-foundations', 'Glute Foundations', 'glutes', 'beginner', 30, 4],
  [
    'glute-strength-and-balance',
    'Glute Strength and Balance',
    'glutes',
    'intermediate',
    40,
    5,
  ],
  ['core-stability-basics', 'Core Stability Basics', 'core', 'beginner', 20, 5],
  [
    'core-strength-and-rotation',
    'Core Strength and Rotation',
    'core',
    'intermediate',
    30,
    5,
  ],
  ['integrated-core-control', 'Integrated Core Control', 'core', 'advanced', 35, 5],
  ['full-body-basics', 'Full Body Basics', 'full-body', 'beginner', 30, 5],
  ['total-body-strength', 'Total Body Strength', 'full-body', 'intermediate', 45, 6],
  [
    'full-body-strength-progression',
    'Full Body Strength Progression',
    'full-body',
    'advanced',
    55,
    6,
  ],
  [
    'experienced-total-body-strength',
    'Experienced Total Body Strength',
    'full-body',
    'experienced',
    60,
    6,
  ],
] as const satisfies readonly (readonly [
  string,
  string,
  RoutineFocus,
  RoutineLevel,
  number,
  number,
])[];

const EXPECTED_FOCUS_COUNTS = {
  chest: 3,
  back: 3,
  shoulders: 2,
  biceps: 2,
  triceps: 2,
  legs: 3,
  glutes: 2,
  core: 3,
  'full-body': 4,
} as const satisfies Record<RoutineFocus, number>;

const EXPECTED_LEVEL_COUNTS = {
  beginner: 9,
  intermediate: 9,
  advanced: 5,
  experienced: 1,
} as const satisfies Record<RoutineLevel, number>;

const EXPECTED_CATALOG_FINGERPRINT = '280a4c95';

function getCatalogFingerprint(routines: readonly DefaultRoutine[]): string {
  const canonicalMatrix = routines.map((routine) => [
    routine.id,
    routine.name,
    routine.description,
    routine.focus,
    routine.level,
    routine.estimatedDurationMinutes ?? null,
    routine.ownership,
    routine.exercises.map((entry) => [
      entry.id,
      entry.order,
      entry.exerciseId,
      entry.prescriptionType,
      entry.sets,
      entry.prescriptionType === 'reps' ? entry.targetReps : entry.targetDurationSeconds,
      entry.restSeconds ?? null,
      entry.notes ?? null,
    ]),
  ]);
  const serializedMatrix = JSON.stringify(canonicalMatrix);
  let hash = 2166136261;

  for (let index = 0; index < serializedMatrix.length; index += 1) {
    hash ^= serializedMatrix.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function defineRoutineCatalog<const T extends readonly DefaultRoutine[]>(
  routines: T,
  exercises: readonly Pick<Exercise, 'id'>[],
): T {
  if (routines.length !== EXPECTED_ROUTINE_MATRIX.length || exercises.length !== 216) {
    throw new Error('Routine catalog does not match the approved matrix');
  }

  const canonicalExerciseIds = new Set(exercises.map((exercise) => exercise.id));
  if (canonicalExerciseIds.size !== exercises.length) {
    throw new Error('Canonical exercise IDs must be unique');
  }

  const routineIds = new Set<string>();
  const allIds = new Set<string>();
  const referencedExerciseIds = new Set<string>();
  const focusCounts = new Map<RoutineFocus, number>();
  const levelCounts = new Map<RoutineLevel, number>();
  let entryCount = 0;
  let timedEntryCount = 0;

  for (const [index, routine] of routines.entries()) {
    const [id, name, focus, level, duration, expectedEntryCount] =
      EXPECTED_ROUTINE_MATRIX[index];

    if (
      !isDefaultRoutine(routine, canonicalExerciseIds) ||
      routine.id !== id ||
      routine.name !== name ||
      routine.focus !== focus ||
      routine.level !== level ||
      routine.estimatedDurationMinutes !== duration ||
      routine.exercises.length !== expectedEntryCount ||
      routineIds.has(routine.id) ||
      allIds.has(routine.id)
    ) {
      throw new Error(`Invalid default routine at catalog position ${index + 1}`);
    }

    routineIds.add(routine.id);
    allIds.add(routine.id);
    focusCounts.set(routine.focus, (focusCounts.get(routine.focus) ?? 0) + 1);
    levelCounts.set(routine.level, (levelCounts.get(routine.level) ?? 0) + 1);

    for (const entry of routine.exercises) {
      const expectedEntryId = `${routine.id}-${String(entry.order).padStart(2, '0')}`;
      if (entry.id !== expectedEntryId || allIds.has(entry.id)) {
        throw new Error(`Invalid or duplicate default routine entry ID: ${entry.id}`);
      }

      allIds.add(entry.id);
      referencedExerciseIds.add(entry.exerciseId);
      entryCount += 1;
      timedEntryCount += entry.prescriptionType === 'timed' ? 1 : 0;
    }
  }

  for (const [focus, expectedCount] of Object.entries(EXPECTED_FOCUS_COUNTS)) {
    if (focusCounts.get(focus as RoutineFocus) !== expectedCount) {
      throw new Error(`Invalid routine focus distribution: ${focus}`);
    }
  }

  for (const [level, expectedCount] of Object.entries(EXPECTED_LEVEL_COUNTS)) {
    if (levelCounts.get(level as RoutineLevel) !== expectedCount) {
      throw new Error(`Invalid routine level distribution: ${level}`);
    }
  }

  if (entryCount !== 109 || referencedExerciseIds.size !== 86 || timedEntryCount !== 9) {
    throw new Error('Routine catalog aggregate totals do not match the approved matrix');
  }

  const fingerprint = getCatalogFingerprint(routines);
  if (fingerprint !== EXPECTED_CATALOG_FINGERPRINT) {
    throw new Error(`Routine catalog content does not match the approved matrix: ${fingerprint}`);
  }

  for (const routine of routines) {
    for (const entry of routine.exercises) {
      Object.freeze(entry);
    }
    Object.freeze(routine.exercises);
    Object.freeze(routine);
  }

  return Object.freeze(routines);
}

export const DEFAULT_ROUTINES = defineRoutineCatalog(
  [
    {
      id: 'chest-foundations',
      name: 'Chest Foundations',
      description: 'Stable pressing and fly variations provide modest, approachable volume.',
      focus: 'chest',
      level: 'beginner',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'chest-foundations-01',
          order: 1,
          exerciseId: 'incline-push-up',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'chest-foundations-02',
          order: 2,
          exerciseId: 'machine-chest-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'chest-foundations-03',
          order: 3,
          exerciseId: 'incline-dumbbell-press',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'chest-foundations-04',
          order: 4,
          exerciseId: 'pec-deck-machine-fly',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'balanced-chest-strength',
      name: 'Balanced Chest Strength',
      description:
        'Two press angles, a fly, and a bodyweight finish cover the chest without excessive volume.',
      focus: 'chest',
      level: 'intermediate',
      estimatedDurationMinutes: 35,
      ownership: 'default',
      exercises: [
        {
          id: 'balanced-chest-strength-01',
          order: 1,
          exerciseId: 'dumbbell-bench-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'balanced-chest-strength-02',
          order: 2,
          exerciseId: 'incline-barbell-bench-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'balanced-chest-strength-03',
          order: 3,
          exerciseId: 'cable-chest-fly',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'balanced-chest-strength-04',
          order: 4,
          exerciseId: 'push-up',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'chest-strength-and-control',
      name: 'Chest Strength and Control',
      description:
        'A lower-rep primary press precedes complementary presses and controlled accessory work.',
      focus: 'chest',
      level: 'advanced',
      estimatedDurationMinutes: 45,
      ownership: 'default',
      exercises: [
        {
          id: 'chest-strength-and-control-01',
          order: 1,
          exerciseId: 'barbell-bench-press',
          prescriptionType: 'reps',
          sets: 4,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'chest-strength-and-control-02',
          order: 2,
          exerciseId: 'incline-dumbbell-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'chest-strength-and-control-03',
          order: 3,
          exerciseId: 'chest-dip',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'chest-strength-and-control-04',
          order: 4,
          exerciseId: 'cable-crossover',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'back-foundations',
      name: 'Back Foundations',
      description:
        'Supported vertical and horizontal pulls limit complexity while extension and hanging round out the session.',
      focus: 'back',
      level: 'beginner',
      estimatedDurationMinutes: 35,
      ownership: 'default',
      exercises: [
        {
          id: 'back-foundations-01',
          order: 1,
          exerciseId: 'seated-lat-pulldown',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'back-foundations-02',
          order: 2,
          exerciseId: 'seated-cable-row',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'back-foundations-03',
          order: 3,
          exerciseId: 'chest-supported-dumbbell-row',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'back-foundations-04',
          order: 4,
          exerciseId: 'back-extension',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'back-foundations-05',
          order: 5,
          exerciseId: 'dead-hang',
          prescriptionType: 'timed',
          sets: 2,
          targetDurationSeconds: 20,
          restSeconds: 45,
        },
      ],
    },
    {
      id: 'pull-and-row-balance',
      name: 'Pull and Row Balance',
      description:
        'Assisted vertical pulling, unilateral rowing, and supported pulling provide balanced progression.',
      focus: 'back',
      level: 'intermediate',
      estimatedDurationMinutes: 35,
      ownership: 'default',
      exercises: [
        {
          id: 'pull-and-row-balance-01',
          order: 1,
          exerciseId: 'assisted-pull-up',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'pull-and-row-balance-02',
          order: 2,
          exerciseId: 'one-arm-dumbbell-row',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
          notes: 'Reps per side.',
        },
        {
          id: 'pull-and-row-balance-03',
          order: 3,
          exerciseId: 't-bar-row',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'pull-and-row-balance-04',
          order: 4,
          exerciseId: 'face-pull',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'back-strength-and-control',
      name: 'Back Strength and Control',
      description:
        'Harder vertical and free-weight pulls come first; supported and cable work control later-session fatigue.',
      focus: 'back',
      level: 'advanced',
      estimatedDurationMinutes: 50,
      ownership: 'default',
      exercises: [
        {
          id: 'back-strength-and-control-01',
          order: 1,
          exerciseId: 'pull-up',
          prescriptionType: 'reps',
          sets: 4,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'back-strength-and-control-02',
          order: 2,
          exerciseId: 'barbell-bent-over-row',
          prescriptionType: 'reps',
          sets: 4,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'back-strength-and-control-03',
          order: 3,
          exerciseId: 'chest-supported-row-machine',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'back-strength-and-control-04',
          order: 4,
          exerciseId: 'straight-arm-pulldown',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'back-strength-and-control-05',
          order: 5,
          exerciseId: 'barbell-shrug',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 75,
        },
      ],
    },
    {
      id: 'shoulder-foundations',
      name: 'Shoulder Foundations',
      description:
        'A stable press plus lateral, rear-shoulder, and external-rotation work covers major shoulder functions.',
      focus: 'shoulders',
      level: 'beginner',
      estimatedDurationMinutes: 25,
      ownership: 'default',
      exercises: [
        {
          id: 'shoulder-foundations-01',
          order: 1,
          exerciseId: 'machine-shoulder-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'shoulder-foundations-02',
          order: 2,
          exerciseId: 'dumbbell-lateral-raise',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'shoulder-foundations-03',
          order: 3,
          exerciseId: 'reverse-pec-deck',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'shoulder-foundations-04',
          order: 4,
          exerciseId: 'resistance-band-external-rotation',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 45,
          notes: 'Reps per side.',
        },
      ],
    },
    {
      id: 'balanced-shoulder-strength',
      name: 'Balanced Shoulder Strength',
      description:
        'Standing pressing and focused lateral and rear-shoulder work balance strength and control.',
      focus: 'shoulders',
      level: 'intermediate',
      estimatedDurationMinutes: 35,
      ownership: 'default',
      exercises: [
        {
          id: 'balanced-shoulder-strength-01',
          order: 1,
          exerciseId: 'standing-dumbbell-shoulder-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'balanced-shoulder-strength-02',
          order: 2,
          exerciseId: 'single-arm-cable-lateral-raise',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'balanced-shoulder-strength-03',
          order: 3,
          exerciseId: 'cable-reverse-fly',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'balanced-shoulder-strength-04',
          order: 4,
          exerciseId: 'face-pull',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'biceps-basics',
      name: 'Biceps Basics',
      description: 'Three accessible curl variations provide a restrained seven working sets.',
      focus: 'biceps',
      level: 'beginner',
      estimatedDurationMinutes: 20,
      ownership: 'default',
      exercises: [
        {
          id: 'biceps-basics-01',
          order: 1,
          exerciseId: 'dumbbell-biceps-curl',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'biceps-basics-02',
          order: 2,
          exerciseId: 'cable-biceps-curl',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'biceps-basics-03',
          order: 3,
          exerciseId: 'rope-hammer-curl',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'varied-curl-strength',
      name: 'Varied Curl Strength',
      description:
        'Bar, incline, cross-body, and machine positions add useful variation without advanced-only techniques.',
      focus: 'biceps',
      level: 'intermediate',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'varied-curl-strength-01',
          order: 1,
          exerciseId: 'ez-bar-curl',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 75,
        },
        {
          id: 'varied-curl-strength-02',
          order: 2,
          exerciseId: 'incline-dumbbell-curl',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'varied-curl-strength-03',
          order: 3,
          exerciseId: 'cross-body-hammer-curl',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'varied-curl-strength-04',
          order: 4,
          exerciseId: 'machine-biceps-curl',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'triceps-basics',
      name: 'Triceps Basics',
      description:
        'Pushdown, overhead, and assisted compound patterns provide broad but modest exposure.',
      focus: 'triceps',
      level: 'beginner',
      estimatedDurationMinutes: 20,
      ownership: 'default',
      exercises: [
        {
          id: 'triceps-basics-01',
          order: 1,
          exerciseId: 'cable-triceps-pushdown',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'triceps-basics-02',
          order: 2,
          exerciseId: 'dumbbell-overhead-triceps-extension',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'triceps-basics-03',
          order: 3,
          exerciseId: 'assisted-dip',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 8,
          restSeconds: 75,
        },
      ],
    },
    {
      id: 'triceps-press-and-extend',
      name: 'Triceps Press and Extend',
      description:
        'Compound presses lead while two cable movements provide controlled finishing volume.',
      focus: 'triceps',
      level: 'intermediate',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'triceps-press-and-extend-01',
          order: 1,
          exerciseId: 'close-grip-bench-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'triceps-press-and-extend-02',
          order: 2,
          exerciseId: 'triceps-dip',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'triceps-press-and-extend-03',
          order: 3,
          exerciseId: 'overhead-cable-triceps-extension',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'triceps-press-and-extend-04',
          order: 4,
          exerciseId: 'rope-triceps-pushdown',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'leg-foundations',
      name: 'Leg Foundations',
      description:
        'One squat, hinge, unilateral movement, and calf exercise cover the lower body efficiently.',
      focus: 'legs',
      level: 'beginner',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'leg-foundations-01',
          order: 1,
          exerciseId: 'goblet-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'leg-foundations-02',
          order: 2,
          exerciseId: 'dumbbell-romanian-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'leg-foundations-03',
          order: 3,
          exerciseId: 'reverse-lunge',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 8,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'leg-foundations-04',
          order: 4,
          exerciseId: 'standing-calf-raise',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'balanced-leg-strength',
      name: 'Balanced Leg Strength',
      description:
        'Squat, hinge, unilateral, hamstring, and calf patterns form a complete moderate-volume session.',
      focus: 'legs',
      level: 'intermediate',
      estimatedDurationMinutes: 45,
      ownership: 'default',
      exercises: [
        {
          id: 'balanced-leg-strength-01',
          order: 1,
          exerciseId: 'hack-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'balanced-leg-strength-02',
          order: 2,
          exerciseId: 'romanian-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'balanced-leg-strength-03',
          order: 3,
          exerciseId: 'split-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 75,
          notes: 'Reps per side.',
        },
        {
          id: 'balanced-leg-strength-04',
          order: 4,
          exerciseId: 'seated-leg-curl',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'balanced-leg-strength-05',
          order: 5,
          exerciseId: 'seated-calf-raise',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'leg-strength-and-balance',
      name: 'Leg Strength and Balance',
      description:
        'A technical squat leads, followed by unilateral strength and supported accessories rather than a second heavy bilateral lift.',
      focus: 'legs',
      level: 'advanced',
      estimatedDurationMinutes: 50,
      ownership: 'default',
      exercises: [
        {
          id: 'leg-strength-and-balance-01',
          order: 1,
          exerciseId: 'barbell-back-squat',
          prescriptionType: 'reps',
          sets: 4,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'leg-strength-and-balance-02',
          order: 2,
          exerciseId: 'single-leg-romanian-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
          notes: 'Reps per side.',
        },
        {
          id: 'leg-strength-and-balance-03',
          order: 3,
          exerciseId: 'single-leg-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 90,
          notes: 'Reps per side.',
        },
        {
          id: 'leg-strength-and-balance-04',
          order: 4,
          exerciseId: 'lying-leg-curl',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'leg-strength-and-balance-05',
          order: 5,
          exerciseId: 'single-leg-calf-raise',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
      ],
    },
    {
      id: 'glute-foundations',
      name: 'Glute Foundations',
      description:
        'Bridge, squat, extension, and abduction patterns provide accessible multidirectional work.',
      focus: 'glutes',
      level: 'beginner',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'glute-foundations-01',
          order: 1,
          exerciseId: 'glute-bridge',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'glute-foundations-02',
          order: 2,
          exerciseId: 'goblet-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'glute-foundations-03',
          order: 3,
          exerciseId: 'cable-glute-kickback',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'glute-foundations-04',
          order: 4,
          exerciseId: 'hip-abduction-machine',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'glute-strength-and-balance',
      name: 'Glute Strength and Balance',
      description:
        'Hip extension, hinging, unilateral squatting, and abduction create balanced moderate-volume work.',
      focus: 'glutes',
      level: 'intermediate',
      estimatedDurationMinutes: 40,
      ownership: 'default',
      exercises: [
        {
          id: 'glute-strength-and-balance-01',
          order: 1,
          exerciseId: 'hip-thrust',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'glute-strength-and-balance-02',
          order: 2,
          exerciseId: 'dumbbell-romanian-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'glute-strength-and-balance-03',
          order: 3,
          exerciseId: 'bulgarian-split-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 75,
          notes: 'Reps per side.',
        },
        {
          id: 'glute-strength-and-balance-04',
          order: 4,
          exerciseId: 'cable-pull-through',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 60,
        },
        {
          id: 'glute-strength-and-balance-05',
          order: 5,
          exerciseId: 'cable-hip-abduction',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 12,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
      ],
    },
    {
      id: 'core-stability-basics',
      name: 'Core Stability Basics',
      description:
        'Supine, prone, lateral, and anti-rotation patterns teach varied bracing demands.',
      focus: 'core',
      level: 'beginner',
      estimatedDurationMinutes: 20,
      ownership: 'default',
      exercises: [
        {
          id: 'core-stability-basics-01',
          order: 1,
          exerciseId: 'dead-bug',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 8,
          restSeconds: 45,
          notes: 'Reps per side.',
        },
        {
          id: 'core-stability-basics-02',
          order: 2,
          exerciseId: 'front-plank',
          prescriptionType: 'timed',
          sets: 3,
          targetDurationSeconds: 20,
          restSeconds: 45,
        },
        {
          id: 'core-stability-basics-03',
          order: 3,
          exerciseId: 'bird-dog',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 8,
          restSeconds: 45,
          notes: 'Reps per side.',
        },
        {
          id: 'core-stability-basics-04',
          order: 4,
          exerciseId: 'side-plank',
          prescriptionType: 'timed',
          sets: 2,
          targetDurationSeconds: 15,
          restSeconds: 45,
          notes: 'Hold each side.',
        },
        {
          id: 'core-stability-basics-05',
          order: 5,
          exerciseId: 'pallof-press',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 45,
          notes: 'Reps per side.',
        },
      ],
    },
    {
      id: 'core-strength-and-rotation',
      name: 'Core Strength and Rotation',
      description:
        'Static control, flexion, shoulder-tap stability, anti-rotation, and rotation broaden the challenge.',
      focus: 'core',
      level: 'intermediate',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'core-strength-and-rotation-01',
          order: 1,
          exerciseId: 'hollow-body-hold',
          prescriptionType: 'timed',
          sets: 3,
          targetDurationSeconds: 20,
          restSeconds: 45,
        },
        {
          id: 'core-strength-and-rotation-02',
          order: 2,
          exerciseId: 'reverse-crunch',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 12,
          restSeconds: 45,
        },
        {
          id: 'core-strength-and-rotation-03',
          order: 3,
          exerciseId: 'plank-shoulder-tap',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'core-strength-and-rotation-04',
          order: 4,
          exerciseId: 'half-kneeling-pallof-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'core-strength-and-rotation-05',
          order: 5,
          exerciseId: 'cable-wood-chop',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
      ],
    },
    {
      id: 'integrated-core-control',
      name: 'Integrated Core Control',
      description:
        'Higher-skill hanging and rollout work is balanced by lateral, rotational, and carry patterns.',
      focus: 'core',
      level: 'advanced',
      estimatedDurationMinutes: 35,
      ownership: 'default',
      exercises: [
        {
          id: 'integrated-core-control-01',
          order: 1,
          exerciseId: 'hanging-leg-raise',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 75,
        },
        {
          id: 'integrated-core-control-02',
          order: 2,
          exerciseId: 'ab-wheel-rollout',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 75,
        },
        {
          id: 'integrated-core-control-03',
          order: 3,
          exerciseId: 'side-plank',
          prescriptionType: 'timed',
          sets: 3,
          targetDurationSeconds: 30,
          restSeconds: 45,
          notes: 'Hold each side.',
        },
        {
          id: 'integrated-core-control-04',
          order: 4,
          exerciseId: 'cable-low-to-high-chop',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
        {
          id: 'integrated-core-control-05',
          order: 5,
          exerciseId: 'suitcase-carry',
          prescriptionType: 'timed',
          sets: 3,
          targetDurationSeconds: 30,
          restSeconds: 60,
          notes: 'Carry on each side.',
        },
      ],
    },
    {
      id: 'full-body-basics',
      name: 'Full Body Basics',
      description:
        'Retains the existing stable ID and supplies a practical squat, push, pull, hinge, and brace session.',
      focus: 'full-body',
      level: 'beginner',
      estimatedDurationMinutes: 30,
      ownership: 'default',
      exercises: [
        {
          id: 'full-body-basics-01',
          order: 1,
          exerciseId: 'bodyweight-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'full-body-basics-02',
          order: 2,
          exerciseId: 'incline-push-up',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 60,
        },
        {
          id: 'full-body-basics-03',
          order: 3,
          exerciseId: 'seated-cable-row',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'full-body-basics-04',
          order: 4,
          exerciseId: 'dumbbell-romanian-deadlift',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'full-body-basics-05',
          order: 5,
          exerciseId: 'front-plank',
          prescriptionType: 'timed',
          sets: 2,
          targetDurationSeconds: 20,
          restSeconds: 45,
        },
      ],
    },
    {
      id: 'total-body-strength',
      name: 'Total Body Strength',
      description:
        'Covers major movement patterns and adds overhead work and a timed carry at manageable volume.',
      focus: 'full-body',
      level: 'intermediate',
      estimatedDurationMinutes: 45,
      ownership: 'default',
      exercises: [
        {
          id: 'total-body-strength-01',
          order: 1,
          exerciseId: 'goblet-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'total-body-strength-02',
          order: 2,
          exerciseId: 'dumbbell-bench-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'total-body-strength-03',
          order: 3,
          exerciseId: 'one-arm-dumbbell-row',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
          notes: 'Reps per side.',
        },
        {
          id: 'total-body-strength-04',
          order: 4,
          exerciseId: 'dumbbell-romanian-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'total-body-strength-05',
          order: 5,
          exerciseId: 'standing-dumbbell-shoulder-press',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 75,
        },
        {
          id: 'total-body-strength-06',
          order: 6,
          exerciseId: 'farmers-carry',
          prescriptionType: 'timed',
          sets: 3,
          targetDurationSeconds: 30,
          restSeconds: 60,
        },
      ],
    },
    {
      id: 'full-body-strength-progression',
      name: 'Full Body Strength Progression',
      description:
        'Moderate three-set compound work develops whole-body strength without an aggressive conditioning circuit.',
      focus: 'full-body',
      level: 'advanced',
      estimatedDurationMinutes: 55,
      ownership: 'default',
      exercises: [
        {
          id: 'full-body-strength-progression-01',
          order: 1,
          exerciseId: 'barbell-back-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'full-body-strength-progression-02',
          order: 2,
          exerciseId: 'dumbbell-bench-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'full-body-strength-progression-03',
          order: 3,
          exerciseId: 'pull-up',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 6,
          restSeconds: 90,
        },
        {
          id: 'full-body-strength-progression-04',
          order: 4,
          exerciseId: 'romanian-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 90,
        },
        {
          id: 'full-body-strength-progression-05',
          order: 5,
          exerciseId: 'landmine-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 8,
          restSeconds: 75,
          notes: 'Reps per side.',
        },
        {
          id: 'full-body-strength-progression-06',
          order: 6,
          exerciseId: 'farmers-carry',
          prescriptionType: 'timed',
          sets: 3,
          targetDurationSeconds: 40,
          restSeconds: 75,
        },
      ],
    },
    {
      id: 'experienced-total-body-strength',
      name: 'Experienced Total Body Strength',
      description:
        'Multiple technical barbell patterns justify the level; low set counts and long rests keep fatigue controlled.',
      focus: 'full-body',
      level: 'experienced',
      estimatedDurationMinutes: 60,
      ownership: 'default',
      exercises: [
        {
          id: 'experienced-total-body-strength-01',
          order: 1,
          exerciseId: 'barbell-back-squat',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 5,
          restSeconds: 150,
        },
        {
          id: 'experienced-total-body-strength-02',
          order: 2,
          exerciseId: 'barbell-bench-press',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'experienced-total-body-strength-03',
          order: 3,
          exerciseId: 'barbell-deadlift',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 5,
          restSeconds: 150,
        },
        {
          id: 'experienced-total-body-strength-04',
          order: 4,
          exerciseId: 'pull-up',
          prescriptionType: 'reps',
          sets: 3,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'experienced-total-body-strength-05',
          order: 5,
          exerciseId: 'barbell-overhead-press',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 6,
          restSeconds: 120,
        },
        {
          id: 'experienced-total-body-strength-06',
          order: 6,
          exerciseId: 'pallof-press',
          prescriptionType: 'reps',
          sets: 2,
          targetReps: 10,
          restSeconds: 60,
          notes: 'Reps per side.',
        },
      ],
    },
  ],
  LOCAL_EXERCISES,
);
