export type HomeAreaPreview = {
  id: 'exercises' | 'routines' | 'admin';
  label: string;
  title: string;
  description: string;
};

export type RoutinePreview = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  exerciseCount: number;
  level: 'Beginner' | 'Intermediate';
};

export type AdminAreaPreview = {
  id: string;
  title: string;
  description: string;
  status: 'Preview only';
};

export const HOME_AREAS = [
  {
    id: 'exercises',
    label: 'Movement library',
    title: 'Exercises',
    description: 'Review a focused starter set with muscle groups, equipment, and level at a glance.',
  },
  {
    id: 'routines',
    label: 'Training plans',
    title: 'Routines',
    description: 'Explore simple sessions organized by duration, difficulty, and exercise count.',
  },
  {
    id: 'admin',
    label: 'Workspace preview',
    title: 'Admin',
    description: 'See where future content management tools will live before operations are connected.',
  },
] as const satisfies readonly HomeAreaPreview[];

export const ROUTINES = [
  {
    id: 'full-body-basics',
    name: 'Full body basics',
    description: 'A balanced first session built around controlled, repeatable movement patterns.',
    durationMinutes: 30,
    exerciseCount: 5,
    level: 'Beginner',
  },
  {
    id: 'upper-body-builder',
    name: 'Upper body builder',
    description: 'A focused strength session for pushing, pulling, and shoulder stability.',
    durationMinutes: 40,
    exerciseCount: 6,
    level: 'Intermediate',
  },
  {
    id: 'mobility-reset',
    name: 'Mobility reset',
    description: 'A short recovery sequence for hips, shoulders, and everyday range of motion.',
    durationMinutes: 15,
    exerciseCount: 4,
    level: 'Beginner',
  },
] as const satisfies readonly RoutinePreview[];

export const ADMIN_AREAS = [
  {
    id: 'exercise-library',
    title: 'Exercise library',
    description: 'A future workspace for reviewing and organizing exercise content.',
    status: 'Preview only',
  },
  {
    id: 'routine-templates',
    title: 'Routine templates',
    description: 'A future workspace for assembling reusable training plans.',
    status: 'Preview only',
  },
  {
    id: 'workspace-settings',
    title: 'Workspace settings',
    description: 'A future home for general Oscar Fitness configuration.',
    status: 'Preview only',
  },
] as const satisfies readonly AdminAreaPreview[];
