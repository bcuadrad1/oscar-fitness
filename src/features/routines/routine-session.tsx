import { createContext, type PropsWithChildren, useContext, useRef, useState } from 'react';

import {
  localExerciseRepository,
  type ExerciseRepository,
} from '@/features/exercises/exercise-repository';
import {
  localRoutineRepository,
  type RoutineRepository,
} from '@/features/routines/routine-repository';
import type {
  RoutineFocusFilter,
  RoutineLevelFilter,
  UserRoutine,
} from '@/features/routines/routine-types';

type RoutineSession = {
  repository: RoutineRepository;
  exerciseRepository: ExerciseRepository;
  focus: RoutineFocusFilter;
  setFocus: (value: RoutineFocusFilter) => void;
  level: RoutineLevelFilter;
  setLevel: (value: RoutineLevelFilter) => void;
  resetFilters: () => void;
  revision: number;
  copyDefaultRoutine: (id: string) => Promise<UserRoutine>;
};

const RoutineSessionContext = createContext<RoutineSession | null>(null);

type RoutineSessionProviderProps = PropsWithChildren<{
  repository?: RoutineRepository;
  exerciseRepository?: ExerciseRepository;
  initialFocus?: RoutineFocusFilter;
  initialLevel?: RoutineLevelFilter;
  onFocusChange?: (value: RoutineFocusFilter) => void;
  onLevelChange?: (value: RoutineLevelFilter) => void;
}>;

export function RoutineSessionProvider({
  children,
  repository = localRoutineRepository,
  exerciseRepository = localExerciseRepository,
  initialFocus = 'All',
  initialLevel = 'All',
  onFocusChange,
  onLevelChange,
}: RoutineSessionProviderProps) {
  const [focus, setFocusState] = useState<RoutineFocusFilter>(initialFocus);
  const [level, setLevelState] = useState<RoutineLevelFilter>(initialLevel);
  const [revision, setRevision] = useState(0);
  const pendingCopies = useRef(new Map<string, Promise<UserRoutine>>());

  function setFocus(value: RoutineFocusFilter) {
    onFocusChange?.(value);
    setFocusState(value);
  }

  function setLevel(value: RoutineLevelFilter) {
    onLevelChange?.(value);
    setLevelState(value);
  }

  function resetFilters() {
    setFocus('All');
    setLevel('All');
  }

  function copyDefaultRoutine(id: string): Promise<UserRoutine> {
    const pendingCopy = pendingCopies.current.get(id);
    if (pendingCopy) {
      return pendingCopy;
    }

    const copy = repository.copyDefaultRoutine(id).then((routine) => {
      setRevision((currentRevision) => currentRevision + 1);
      return routine;
    });
    const trackedCopy = copy.finally(() => {
      if (pendingCopies.current.get(id) === trackedCopy) {
        pendingCopies.current.delete(id);
      }
    });
    pendingCopies.current.set(id, trackedCopy);
    return trackedCopy;
  }

  return (
    <RoutineSessionContext.Provider
      value={{
        repository,
        exerciseRepository,
        focus,
        setFocus,
        level,
        setLevel,
        resetFilters,
        revision,
        copyDefaultRoutine,
      }}>
      {children}
    </RoutineSessionContext.Provider>
  );
}

export function useRoutineSession() {
  const session = useContext(RoutineSessionContext);

  if (!session) {
    throw new Error('useRoutineSession must be used inside RoutineSessionProvider');
  }

  return session;
}
