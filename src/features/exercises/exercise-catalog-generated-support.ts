import type { Exercise } from '@/features/exercises/exercise-types';

const DEVELOPMENT_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';
const PLACEHOLDER_THUMBNAIL_SOURCE = require('../../../assets/images/exercises/push-up.png');

type GeneratedExerciseInput = Omit<Exercise, 'thumbnail' | 'video'>;

export function createGeneratedExercise(input: GeneratedExerciseInput): Exercise {
  return {
    ...input,
    thumbnail: {
      source: PLACEHOLDER_THUMBNAIL_SOURCE,
      alt: `Placeholder exercise illustration for ${input.name}`,
    },
    video: {
      uri: DEVELOPMENT_VIDEO_URL,
      label: 'Development playback sample - non-exercise media',
      accessibilityLabel: `Non-exercise development playback sample for ${input.name}`,
    },
  };
}
