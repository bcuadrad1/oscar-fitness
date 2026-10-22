import { LOCAL_EXERCISES } from '@/features/exercises/exercise-catalog';
import { DEFAULT_ROUTINES } from '@/features/routines/routine-catalog';
import {
  asyncStorageRoutineStorage,
  type RoutineStorage,
} from '@/features/routines/routine-storage';
import {
  isUserRoutine,
  type DefaultRoutine,
  type Routine,
  type RoutineExercise,
  type UserRoutine,
} from '@/features/routines/routine-types';

export interface RoutineRepository {
  listRoutines(): Promise<readonly Routine[]>;
  getRoutineById(id: string): Promise<Routine | null>;
  copyDefaultRoutine(id: string): Promise<UserRoutine>;
}

export type RoutineIdGenerator = () => string;
export type RoutineClock = () => Date;

export type LocalRoutineRepositoryOptions = {
  storage?: RoutineStorage;
  generateId?: RoutineIdGenerator;
  clock?: RoutineClock;
};

export const USER_ROUTINE_STORAGE_VERSION = 1 as const;

export type UserRoutineStorageEnvelope = {
  version: typeof USER_ROUTINE_STORAGE_VERSION;
  userRoutines: UserRoutine[];
};

const canonicalExerciseIds = new Set<string>(LOCAL_EXERCISES.map((exercise) => exercise.id));
const defaultRoutineIds = new Set<string>(DEFAULT_ROUTINES.map((routine) => routine.id));
const defaultIds = new Set<string>(
  DEFAULT_ROUTINES.flatMap((routine) => [
    routine.id,
    ...routine.exercises.map((exercise) => exercise.id),
  ]),
);

let generatedIdSequence = 0;

function generateLocalId(): string {
  generatedIdSequence += 1;
  return `routine-${Date.now().toString(36)}-${generatedIdSequence.toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function cloneRoutineExercise(exercise: RoutineExercise): RoutineExercise {
  return { ...exercise };
}

function cloneUserRoutine(routine: UserRoutine): UserRoutine {
  return {
    ...routine,
    exercises: routine.exercises.map(cloneRoutineExercise),
  };
}

function isStorageEnvelope(value: unknown): value is UserRoutineStorageEnvelope {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return keys.length === 2 &&
    keys.includes('version') &&
    keys.includes('userRoutines') &&
    'version' in value &&
    value.version === USER_ROUTINE_STORAGE_VERSION &&
    'userRoutines' in value &&
    Array.isArray(value.userRoutines);
}

function serializeUserRoutines(userRoutines: readonly UserRoutine[]): string {
  const envelope: UserRoutineStorageEnvelope = {
    version: USER_ROUTINE_STORAGE_VERSION,
    userRoutines: userRoutines.map(cloneUserRoutine),
  };

  return JSON.stringify(envelope);
}

function hasAvailableIds(routine: UserRoutine, usedIds: ReadonlySet<string>): boolean {
  const candidateIds = [routine.id, ...routine.exercises.map((exercise) => exercise.id)];
  return new Set(candidateIds).size === candidateIds.length &&
    candidateIds.every((id) => !usedIds.has(id));
}

function acceptPersistedUserRoutines(value: string | null): UserRoutine[] {
  if (value === null) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    return [];
  }

  if (!isStorageEnvelope(parsed)) {
    return [];
  }

  const accepted: UserRoutine[] = [];
  const usedIds = new Set(defaultIds);

  for (const candidate of parsed.userRoutines as unknown[]) {
    if (
      !isUserRoutine(candidate, canonicalExerciseIds) ||
      (candidate.sourceRoutineId !== undefined &&
        !defaultRoutineIds.has(candidate.sourceRoutineId)) ||
      !hasAvailableIds(candidate, usedIds)
    ) {
      continue;
    }

    const routine = cloneUserRoutine(candidate);
    accepted.push(routine);
    usedIds.add(routine.id);
    for (const exercise of routine.exercises) {
      usedIds.add(exercise.id);
    }
  }

  return accepted;
}

class LocalRoutineRepository implements RoutineRepository {
  private readonly storage: RoutineStorage;
  private readonly generateId: RoutineIdGenerator;
  private readonly clock: RoutineClock;
  private userRoutines: UserRoutine[] = [];
  private initialization: Promise<void> | null = null;
  private initialized = false;
  private copyQueue: Promise<void> = Promise.resolve();

  constructor({
    storage = asyncStorageRoutineStorage,
    generateId = generateLocalId,
    clock = () => new Date(),
  }: LocalRoutineRepositoryOptions = {}) {
    this.storage = storage;
    this.generateId = generateId;
    this.clock = clock;
    this.startInitialization();
  }

  async listRoutines(): Promise<readonly Routine[]> {
    await this.ensureInitialized();
    return [...DEFAULT_ROUTINES, ...this.userRoutines.map(cloneUserRoutine)];
  }

  async getRoutineById(id: string): Promise<Routine | null> {
    await this.ensureInitialized();

    const defaultRoutine = DEFAULT_ROUTINES.find((routine) => routine.id === id);
    if (defaultRoutine !== undefined) {
      return defaultRoutine;
    }

    const userRoutine = this.userRoutines.find((routine) => routine.id === id);
    return userRoutine === undefined ? null : cloneUserRoutine(userRoutine);
  }

  copyDefaultRoutine(id: string): Promise<UserRoutine> {
    const operation = this.copyQueue.then(() => this.performCopy(id));
    this.copyQueue = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  private startInitialization(): Promise<void> {
    if (this.initialization === null) {
      const initialization = this.loadUserRoutines();
      initialization.catch(() => undefined);
      this.initialization = initialization;
    }

    return this.initialization;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const initialization = this.startInitialization();
    try {
      await initialization;
    } catch (error) {
      if (this.initialization === initialization) {
        this.initialization = null;
      }
      throw error;
    }
  }

  private async loadUserRoutines(): Promise<void> {
    const storedValue = await this.storage.read();
    this.userRoutines = acceptPersistedUserRoutines(storedValue);
    this.initialized = true;
  }

  private async performCopy(id: string): Promise<UserRoutine> {
    await this.ensureInitialized();

    const source = DEFAULT_ROUTINES.find((routine) => routine.id === id);
    if (source === undefined) {
      throw new Error(`Default routine not found: ${id}`);
    }

    const timestamp = this.createTimestamp();
    const candidate = this.createCopyCandidate(source, timestamp);
    const usedIds = new Set(defaultIds);
    for (const routine of this.userRoutines) {
      usedIds.add(routine.id);
      for (const exercise of routine.exercises) {
        usedIds.add(exercise.id);
      }
    }

    if (
      !isUserRoutine(candidate, canonicalExerciseIds) ||
      candidate.sourceRoutineId !== source.id ||
      !hasAvailableIds(candidate, usedIds)
    ) {
      throw new Error('Generated routine copy is invalid');
    }

    const nextUserRoutines = [...this.userRoutines, candidate];
    await this.storage.write(serializeUserRoutines(nextUserRoutines));
    this.userRoutines = nextUserRoutines;
    return cloneUserRoutine(candidate);
  }

  private createTimestamp(): string {
    const date = this.clock();
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error('Routine clock returned an invalid date');
    }

    return date.toISOString();
  }

  private createCopyCandidate(source: DefaultRoutine, timestamp: string): UserRoutine {
    return {
      id: this.generateId(),
      name: `${source.name} Copy`,
      description: source.description,
      focus: source.focus,
      level: source.level,
      ...(source.estimatedDurationMinutes === undefined
        ? {}
        : { estimatedDurationMinutes: source.estimatedDurationMinutes }),
      exercises: source.exercises.map((exercise) => ({
        ...exercise,
        id: this.generateId(),
      })),
      ownership: 'user',
      createdAt: timestamp,
      updatedAt: timestamp,
      sourceRoutineId: source.id,
    };
  }
}

export function createLocalRoutineRepository(
  options: LocalRoutineRepositoryOptions = {},
): RoutineRepository {
  return new LocalRoutineRepository(options);
}

export const localRoutineRepository = createLocalRoutineRepository();
