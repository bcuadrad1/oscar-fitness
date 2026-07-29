import type { Exercise, ExerciseFilters } from '@/features/exercises/exercise-types';

export function filterExercises(
  exercises: readonly Exercise[],
  filters: ExerciseFilters,
): readonly Exercise[] {
  const query = filters.searchText.trim().toLocaleLowerCase();

  return exercises.filter((exercise) => {
    const matchesName = query.length === 0 || exercise.name.toLocaleLowerCase().includes(query);
    const matchesBodyArea =
      filters.bodyArea === 'All' || exercise.targetBodyArea === filters.bodyArea;
    const matchesDifficulty =
      filters.difficulty === 'All' || exercise.difficulty === filters.difficulty;

    return matchesName && matchesBodyArea && matchesDifficulty;
  });
}
