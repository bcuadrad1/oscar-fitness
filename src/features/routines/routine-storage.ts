import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RoutineStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
}

export const ROUTINE_STORAGE_KEY = '@oscar-fitness/routines/v1';

export function createAsyncStorageRoutineStorage(
  key: string = ROUTINE_STORAGE_KEY,
): RoutineStorage {
  return {
    read: () => AsyncStorage.getItem(key),
    write: (value) => AsyncStorage.setItem(key, value),
  };
}

export const asyncStorageRoutineStorage = createAsyncStorageRoutineStorage();
