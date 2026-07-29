import { createContext, type PropsWithChildren, useContext, useState } from 'react';

import {
  type ExerciseBodyAreaFilter,
  type ExerciseDifficultyFilter,
} from '@/features/exercises/exercise-types';
import {
  localExerciseRepository,
  type ExerciseRepository,
} from '@/features/exercises/exercise-repository';

type ExerciseSession = {
  repository: ExerciseRepository;
  searchText: string;
  setSearchText: (value: string) => void;
  bodyArea: ExerciseBodyAreaFilter;
  setBodyArea: (value: ExerciseBodyAreaFilter) => void;
  difficulty: ExerciseDifficultyFilter;
  setDifficulty: (value: ExerciseDifficultyFilter) => void;
  resetDiscovery: () => void;
};

const ExerciseSessionContext = createContext<ExerciseSession | null>(null);

type ExerciseSessionProviderProps = PropsWithChildren<{
  repository?: ExerciseRepository;
}>;

export function ExerciseSessionProvider({
  children,
  repository = localExerciseRepository,
}: ExerciseSessionProviderProps) {
  const [searchText, setSearchText] = useState('');
  const [bodyArea, setBodyArea] = useState<ExerciseBodyAreaFilter>('All');
  const [difficulty, setDifficulty] = useState<ExerciseDifficultyFilter>('All');

  function resetDiscovery() {
    setSearchText('');
    setBodyArea('All');
    setDifficulty('All');
  }

  return (
    <ExerciseSessionContext.Provider
      value={{
        repository,
        searchText,
        setSearchText,
        bodyArea,
        setBodyArea,
        difficulty,
        setDifficulty,
        resetDiscovery,
      }}>
      {children}
    </ExerciseSessionContext.Provider>
  );
}

export function useExerciseSession() {
  const session = useContext(ExerciseSessionContext);

  if (!session) {
    throw new Error('useExerciseSession must be used inside ExerciseSessionProvider');
  }

  return session;
}
