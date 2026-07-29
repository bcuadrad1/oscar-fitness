import type { Exercise } from '@/features/exercises/exercise-types';

export interface ExerciseRepository {
  listExercises(): Promise<readonly Exercise[]>;
  getExerciseById(id: string): Promise<Exercise | null>;
}

const DEVELOPMENT_VIDEO_URL =
  'https://www.w3schools.com/html/mov_bbb.mp4';

const EXERCISES = [
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    targetBodyArea: 'Lower body',
    category: 'Strength',
    difficulty: 'Beginner',
    equipment: 'Bodyweight / no equipment',
    description: 'A controlled lower-body pattern for practicing a stable sit-to-stand movement.',
    instructions: [
      'Stand with feet about shoulder-width apart and toes turned out slightly.',
      'Brace the trunk, keep the chest tall, and send the hips down and back.',
      'Let the knees track with the toes and lower only while the heels stay planted and movement remains controlled.',
      'Press through the whole feet to stand; reduce the range or stop if form breaks or pain occurs.',
    ],
    thumbnail: {
      source: require('../../../assets/images/exercises/bodyweight-squat.png'),
      alt: 'Abstract illustration of a person performing a bodyweight squat',
    },
    video: {
      uri: DEVELOPMENT_VIDEO_URL,
      label: 'Development playback sample - non-exercise media',
      accessibilityLabel: 'Non-exercise development playback sample for Bodyweight Squat',
    },
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    targetBodyArea: 'Chest / upper body',
    category: 'Strength',
    difficulty: 'Intermediate',
    equipment: 'Bodyweight / no equipment',
    description: 'A bodyweight press for the chest, shoulders, triceps, and trunk.',
    instructions: [
      'Start in a high plank with hands slightly wider than the shoulders and the body in one line.',
      'Brace the abdomen and glutes while keeping the shoulders away from the ears.',
      'Bend the elbows about 45 degrees and lower only as far as control and comfort allow.',
      'Press the floor away to return without letting the hips sag; reduce the range or stop if form breaks or pain occurs.',
    ],
    thumbnail: {
      source: require('../../../assets/images/exercises/push-up.png'),
      alt: 'Abstract illustration of a person performing a push-up',
    },
    video: null,
  },
] as const satisfies readonly Exercise[];

class LocalExerciseRepository implements ExerciseRepository {
  listExercises(): Promise<readonly Exercise[]> {
    return Promise.resolve(EXERCISES);
  }

  getExerciseById(id: string): Promise<Exercise | null> {
    return Promise.resolve(EXERCISES.find((exercise) => exercise.id === id) ?? null);
  }
}

export const localExerciseRepository: ExerciseRepository = new LocalExerciseRepository();
