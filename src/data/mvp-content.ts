export type HomeAreaPreview = {
  id: 'exercises' | 'routines' | 'admin';
  label: string;
  title: string;
  description: string;
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
