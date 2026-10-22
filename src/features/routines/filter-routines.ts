import type { Routine, RoutineFilters } from '@/features/routines/routine-types';

export function filterRoutines(
  routines: readonly Routine[],
  filters: RoutineFilters,
): readonly Routine[] {
  return routines.filter((routine) => {
    const matchesFocus = filters.focus === 'All' || routine.focus === filters.focus;
    const matchesLevel = filters.level === 'All' || routine.level === filters.level;

    return matchesFocus && matchesLevel;
  });
}
