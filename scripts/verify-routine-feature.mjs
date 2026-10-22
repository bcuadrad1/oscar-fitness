import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUTINE_TYPES_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/routine-types.ts',
);
const ROUTINE_CATALOG_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/routine-catalog.ts',
);
const ROUTINE_STORAGE_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/routine-storage.ts',
);
const ROUTINE_REPOSITORY_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/routine-repository.ts',
);
const ROUTINE_FILTER_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/filter-routines.ts',
);
const ROUTINE_SESSION_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/routine-session.tsx',
);
const ROUTINE_DATA_PATH = path.join(
  ROOT_DIR,
  'src/features/routines/use-routine-data.ts',
);
const ROUTINE_CARD_PATH = path.join(
  ROOT_DIR,
  'src/components/routines/routine-card.tsx',
);
const ROUTINE_DETAIL_PATH = path.join(
  ROOT_DIR,
  'src/components/routines/routine-detail.tsx',
);
const ROUTINE_ROUTE_PATH = path.join(
  ROOT_DIR,
  'src/app/routines/[routineId].tsx',
);
const EXERCISE_CATALOG_PATH = path.join(
  ROOT_DIR,
  'src/features/exercises/exercise-catalog.ts',
);
const EXERCISE_TYPES_PATH = path.join(
  ROOT_DIR,
  'src/features/exercises/exercise-types.ts',
);
const APP_CONFIG_PATH = path.join(ROOT_DIR, 'app.json');

const EXPECTED_ROUTINE_METADATA = [
  ['chest-foundations', 'Chest Foundations', 'chest', 'beginner', 30, 4],
  ['balanced-chest-strength', 'Balanced Chest Strength', 'chest', 'intermediate', 35, 4],
  ['chest-strength-and-control', 'Chest Strength and Control', 'chest', 'advanced', 45, 4],
  ['back-foundations', 'Back Foundations', 'back', 'beginner', 35, 5],
  ['pull-and-row-balance', 'Pull and Row Balance', 'back', 'intermediate', 35, 4],
  ['back-strength-and-control', 'Back Strength and Control', 'back', 'advanced', 50, 5],
  ['shoulder-foundations', 'Shoulder Foundations', 'shoulders', 'beginner', 25, 4],
  ['balanced-shoulder-strength', 'Balanced Shoulder Strength', 'shoulders', 'intermediate', 35, 4],
  ['biceps-basics', 'Biceps Basics', 'biceps', 'beginner', 20, 3],
  ['varied-curl-strength', 'Varied Curl Strength', 'biceps', 'intermediate', 30, 4],
  ['triceps-basics', 'Triceps Basics', 'triceps', 'beginner', 20, 3],
  ['triceps-press-and-extend', 'Triceps Press and Extend', 'triceps', 'intermediate', 30, 4],
  ['leg-foundations', 'Leg Foundations', 'legs', 'beginner', 30, 4],
  ['balanced-leg-strength', 'Balanced Leg Strength', 'legs', 'intermediate', 45, 5],
  ['leg-strength-and-balance', 'Leg Strength and Balance', 'legs', 'advanced', 50, 5],
  ['glute-foundations', 'Glute Foundations', 'glutes', 'beginner', 30, 4],
  ['glute-strength-and-balance', 'Glute Strength and Balance', 'glutes', 'intermediate', 40, 5],
  ['core-stability-basics', 'Core Stability Basics', 'core', 'beginner', 20, 5],
  ['core-strength-and-rotation', 'Core Strength and Rotation', 'core', 'intermediate', 30, 5],
  ['integrated-core-control', 'Integrated Core Control', 'core', 'advanced', 35, 5],
  ['full-body-basics', 'Full Body Basics', 'full-body', 'beginner', 30, 5],
  ['total-body-strength', 'Total Body Strength', 'full-body', 'intermediate', 45, 6],
  ['full-body-strength-progression', 'Full Body Strength Progression', 'full-body', 'advanced', 55, 6],
  ['experienced-total-body-strength', 'Experienced Total Body Strength', 'full-body', 'experienced', 60, 6],
];

const EXPECTED_FOCUS_COUNTS = {
  chest: 3,
  back: 3,
  shoulders: 2,
  biceps: 2,
  triceps: 2,
  legs: 3,
  glutes: 2,
  core: 3,
  'full-body': 4,
};
const EXPECTED_LEVEL_COUNTS = {
  beginner: 9,
  intermediate: 9,
  advanced: 5,
  experienced: 1,
};
const FIXED_TIMESTAMP = '2026-10-19T12:34:56.000Z';
const requireNodeModule = createRequire(import.meta.url);
const React = requireNodeModule('react');
const { renderToStaticMarkup } = requireNodeModule('react-dom/server');

let asyncStorageGetItem = async () => null;
let asyncStorageSetItem = async () => undefined;
const mockedAsyncStorage = {
  getItem: (...args) => asyncStorageGetItem(...args),
  setItem: (...args) => asyncStorageSetItem(...args),
};

function resolveTypeScriptModule(basePath) {
  for (const candidate of [basePath, `${basePath}.ts`, `${basePath}.tsx`]) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Unable to resolve TypeScript module: ${basePath}`);
}

function loadTypeScriptModule(filePath, cache = new Map()) {
  if (cache.has(filePath)) {
    return cache.get(filePath).exports;
  }

  const module = { exports: {} };
  cache.set(filePath, module);
  const source = readFileSync(filePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const requireModule = (request) => {
    if (request === '@react-native-async-storage/async-storage') {
      return { __esModule: true, default: mockedAsyncStorage };
    }
    if (request.startsWith('@/')) {
      return loadTypeScriptModule(
        resolveTypeScriptModule(path.join(ROOT_DIR, 'src', request.slice(2))),
        cache,
      );
    }
    if (request.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(filePath), request);
      if (path.extname(resolvedPath) === '.png') {
        return resolvedPath;
      }
      return loadTypeScriptModule(resolveTypeScriptModule(resolvedPath), cache);
    }
    return requireNodeModule(request);
  };
  const run = new Function(
    'require',
    'module',
    'exports',
    '__filename',
    '__dirname',
    output,
  );
  run(requireModule, module, module.exports, filePath, path.dirname(filePath));
  return module.exports;
}

function executeCommonJs(source, filePath, requireModule = () => ({})) {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  }).outputText;
  const module = { exports: {} };
  const run = new Function(
    'require',
    'module',
    'exports',
    '__filename',
    '__dirname',
    output,
  );
  run(requireModule, module, module.exports, filePath, path.dirname(filePath));
  return module.exports;
}

function expectThrow(action, expectedMessage) {
  assert.throws(action, (error) => {
    assert.match(error.message, expectedMessage);
    return true;
  });
}

async function expectReject(action, expectedMessage) {
  await assert.rejects(action, (error) => {
    assert.match(error.message, expectedMessage);
    return true;
  });
}

function countBy(values, getKey) {
  const counts = {};
  for (const value of values) {
    const key = getKey(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function assertRecursivelyFrozen(value, location = 'catalog') {
  if (typeof value !== 'object' || value === null) {
    return;
  }
  assert.ok(Object.isFrozen(value), `${location} is not frozen`);
  for (const [key, child] of Object.entries(value)) {
    assertRecursivelyFrozen(child, `${location}.${key}`);
  }
}

function createMemoryStorage(initialValue = null) {
  let value = initialValue;
  const writes = [];
  let readCount = 0;
  return {
    storage: {
      async read() {
        readCount += 1;
        return value;
      },
      async write(nextValue) {
        writes.push(nextValue);
        value = nextValue;
      },
    },
    get value() {
      return value;
    },
    get readCount() {
      return readCount;
    },
    writes,
  };
}

function createIdGenerator(prefix) {
  let sequence = 0;
  return () => `${prefix}-${++sequence}`;
}

function createUserRoutine(source, id, options = {}) {
  const {
    entryPrefix = `${id}-entry`,
    includeEstimate = true,
    includeSource = true,
    sourceRoutineId = source.id,
  } = options;
  return {
    id,
    name: `${source.name} Copy`,
    description: source.description,
    focus: source.focus,
    level: source.level,
    ...(includeEstimate && source.estimatedDurationMinutes !== undefined
      ? { estimatedDurationMinutes: source.estimatedDurationMinutes }
      : {}),
    exercises: source.exercises.map((entry, index) => ({
      ...entry,
      id: `${entryPrefix}-${index + 1}`,
    })),
    ownership: 'user',
    createdAt: FIXED_TIMESTAMP,
    updatedAt: FIXED_TIMESTAMP,
    ...(includeSource ? { sourceRoutineId } : {}),
  };
}

function serializeEnvelope(userRoutines, version = 1) {
  return JSON.stringify({ version, userRoutines });
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createHookHarness() {
  let activeInstance = null;

  function getActiveHook() {
    assert.ok(activeInstance, 'A React hook ran outside the deterministic harness');
    const hookIndex = activeInstance.cursor;
    activeInstance.cursor += 1;
    return { hookIndex, instance: activeInstance };
  }

  const react = {
    createContext(defaultValue) {
      const context = { currentValue: defaultValue };
      context.Provider = { context };
      return context;
    },
    useContext(context) {
      return context.currentValue;
    },
    useEffect(effect, dependencies) {
      const { hookIndex, instance } = getActiveHook();
      const previous = instance.hooks[hookIndex];
      const changed =
        previous === undefined ||
        dependencies === undefined ||
        previous.dependencies === undefined ||
        dependencies.length !== previous.dependencies.length ||
        dependencies.some(
          (dependency, index) => !Object.is(dependency, previous.dependencies[index]),
        );

      if (!changed) {
        return;
      }

      instance.pendingEffects.push({ effect, hookIndex, previousCleanup: previous?.cleanup });
      instance.hooks[hookIndex] = { dependencies, cleanup: undefined };
    },
    useRef(initialValue) {
      const { hookIndex, instance } = getActiveHook();
      if (instance.hooks[hookIndex] === undefined) {
        instance.hooks[hookIndex] = { current: initialValue };
      }
      return instance.hooks[hookIndex];
    },
    useState(initialValue) {
      const { hookIndex, instance } = getActiveHook();
      if (instance.hooks[hookIndex] === undefined) {
        const hook = {
          value: typeof initialValue === 'function' ? initialValue() : initialValue,
          setValue(nextValue) {
            hook.value = typeof nextValue === 'function' ? nextValue(hook.value) : nextValue;
          },
        };
        instance.hooks[hookIndex] = hook;
      }
      const hook = instance.hooks[hookIndex];
      return [hook.value, hook.setValue];
    },
  };

  function renderJsx(type, props) {
    if (type?.context) {
      type.context.currentValue = props.value;
      return props.children ?? null;
    }
    if (typeof type === 'function') {
      return type(props);
    }
    return { props, type };
  }

  function createRenderer(renderFunction) {
    const instance = {
      cursor: 0,
      hooks: [],
      pendingEffects: [],
      result: undefined,
    };

    return {
      render(...args) {
        assert.equal(activeInstance, null, 'The hook harness does not support nested renders');
        instance.cursor = 0;
        instance.pendingEffects = [];
        activeInstance = instance;
        try {
          instance.result = renderFunction(...args);
        } finally {
          activeInstance = null;
        }

        for (const pendingEffect of instance.pendingEffects) {
          pendingEffect.previousCleanup?.();
          const cleanup = pendingEffect.effect();
          instance.hooks[pendingEffect.hookIndex].cleanup =
            typeof cleanup === 'function' ? cleanup : undefined;
        }
        return instance.result;
      },
      unmount() {
        for (const hook of instance.hooks) {
          hook?.cleanup?.();
        }
      },
    };
  }

  return {
    createRenderer,
    jsxRuntime: {
      Fragment: Symbol('Fragment'),
      jsx: renderJsx,
      jsxs: renderJsx,
    },
    react,
  };
}

function loadHookModules() {
  const harness = createHookHarness();
  const defaultRoutineRepository = {};
  const defaultExerciseRepository = {};
  const requireHookModule = (request) => {
    if (request === 'react') {
      return harness.react;
    }
    if (request === 'react/jsx-runtime') {
      return harness.jsxRuntime;
    }
    if (request.endsWith('/routine-repository')) {
      return { localRoutineRepository: defaultRoutineRepository };
    }
    if (request.endsWith('/exercise-repository')) {
      return { localExerciseRepository: defaultExerciseRepository };
    }
    return {};
  };

  return {
    dataExports: executeCommonJs(
      readFileSync(ROUTINE_DATA_PATH, 'utf8'),
      ROUTINE_DATA_PATH,
      requireHookModule,
    ),
    harness,
    sessionExports: executeCommonJs(
      readFileSync(ROUTINE_SESSION_PATH, 'utf8'),
      ROUTINE_SESSION_PATH,
      requireHookModule,
    ),
  };
}

async function flushAsyncWork() {
  await new Promise((resolve) => setImmediate(resolve));
}

async function waitFor(predicate, message) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.fail(message);
}

function assertUserOnlyEnvelope(serialized, expectedCount, defaultRoutines) {
  const envelope = JSON.parse(serialized);
  assert.deepEqual(Object.keys(envelope).sort(), ['userRoutines', 'version']);
  assert.equal(envelope.version, 1);
  assert.equal(envelope.userRoutines.length, expectedCount);

  const defaultRoutineIds = new Set(defaultRoutines.map((routine) => routine.id));
  const defaultEntryIds = new Set(
    defaultRoutines.flatMap((routine) => routine.exercises.map((entry) => entry.id)),
  );
  const routineKeys = new Set([
    'id',
    'name',
    'description',
    'focus',
    'level',
    'estimatedDurationMinutes',
    'exercises',
    'ownership',
    'createdAt',
    'updatedAt',
    'sourceRoutineId',
  ]);
  const entryKeys = new Set([
    'id',
    'order',
    'exerciseId',
    'sets',
    'prescriptionType',
    'targetReps',
    'targetDurationSeconds',
    'restSeconds',
    'notes',
  ]);

  for (const routine of envelope.userRoutines) {
    assert.equal(routine.ownership, 'user');
    assert.ok(!defaultRoutineIds.has(routine.id));
    assert.ok(Object.keys(routine).every((key) => routineKeys.has(key)));
    for (const entry of routine.exercises) {
      assert.ok(!defaultEntryIds.has(entry.id));
      assert.ok(Object.keys(entry).every((key) => entryKeys.has(key)));
      for (const forbiddenKey of [
        'name',
        'difficulty',
        'equipmentIds',
        'instructions',
        'thumbnail',
        'video',
      ]) {
        assert.ok(!Object.hasOwn(entry, forbiddenKey));
      }
    }
  }
}

function createNativeComponent(tagName) {
  return function NativeComponent({
    accessibilityHint,
    accessibilityLabel,
    accessibilityLiveRegion,
    accessibilityRole,
    accessibilityState,
    children,
    disabled,
  }) {
    return React.createElement(
      tagName,
      {
        'aria-busy': accessibilityState?.busy,
        'aria-checked': accessibilityState?.checked,
        'aria-description': accessibilityHint,
        'aria-disabled': accessibilityState?.disabled,
        'aria-label': accessibilityLabel,
        'aria-live': accessibilityLiveRegion,
        disabled,
        role: accessibilityRole === 'summary' ? 'status' : accessibilityRole,
      },
      children,
    );
  };
}

function createPresentationRequire(routineTypes, exerciseTypes) {
  const View = createNativeComponent('div');
  const Pressable = createNativeComponent('button');
  const Text = createNativeComponent('span');
  const ThemedText = ({ children, ...props }) =>
    React.createElement(Text, props, children);
  const ThemedView = ({ children, ...props }) =>
    React.createElement(View, props, children);
  const theme = {
    accent: '#000',
    background: '#fff',
    backgroundElement: '#eee',
    backgroundSelected: '#ddd',
    border: '#ccc',
    text: '#000',
    textSecondary: '#333',
  };

  return (request) => {
    if (request === 'react' || request === 'react/jsx-runtime') {
      return requireNodeModule(request);
    }
    if (request === 'react-native') {
      return {
        ActivityIndicator: createNativeComponent('span'),
        Pressable,
        StyleSheet: { create: (styles) => styles },
        View,
      };
    }
    if (request === 'expo-router') {
      return {
        Link: ({ children, href }) => {
          let resolvedHref = href;
          if (typeof href === 'object') {
            resolvedHref = href.pathname;
            for (const [key, value] of Object.entries(href.params ?? {})) {
              resolvedHref = resolvedHref.replace(`[${key}]`, String(value));
            }
          }
          return React.createElement('a', { href: resolvedHref }, children);
        },
      };
    }
    if (request.endsWith('/routine-types')) {
      return routineTypes;
    }
    if (request.endsWith('/exercise-types')) {
      return exerciseTypes;
    }
    if (request.endsWith('/routine-state-panel')) {
      return {
        RoutineActionButton: ({ busy, disabled, label }) =>
          React.createElement(
            'button',
            { 'aria-busy': busy, disabled },
            label,
          ),
      };
    }
    if (request.endsWith('/section-screen')) {
      return {
        SectionScreen: ({ children, description, eyebrow, title }) =>
          React.createElement(
            'main',
            null,
            React.createElement('span', null, eyebrow),
            React.createElement('h1', null, title),
            React.createElement('p', null, description),
            children,
          ),
      };
    }
    if (request.endsWith('/themed-text')) {
      return { ThemedText };
    }
    if (request.endsWith('/themed-view')) {
      return { ThemedView };
    }
    if (request.endsWith('/constants/theme')) {
      return {
        Spacing: { one: 4, two: 8, three: 16, four: 24, five: 32 },
      };
    }
    if (request.endsWith('/use-theme')) {
      return { useTheme: () => theme };
    }
    return {};
  };
}

async function verifyCatalog(catalogExports, exerciseCatalogExports, routineTypes) {
  const { DEFAULT_ROUTINES, defineRoutineCatalog } = catalogExports;
  const { LOCAL_EXERCISES } = exerciseCatalogExports;
  assert.equal(DEFAULT_ROUTINES.length, 24);
  assert.deepEqual(
    DEFAULT_ROUTINES.map((routine) => [
      routine.id,
      routine.name,
      routine.focus,
      routine.level,
      routine.estimatedDurationMinutes,
      routine.exercises.length,
    ]),
    EXPECTED_ROUTINE_METADATA,
  );
  assert.deepEqual(countBy(DEFAULT_ROUTINES, (routine) => routine.focus), EXPECTED_FOCUS_COUNTS);
  assert.deepEqual(countBy(DEFAULT_ROUTINES, (routine) => routine.level), EXPECTED_LEVEL_COUNTS);

  const entries = DEFAULT_ROUTINES.flatMap((routine) => routine.exercises);
  const entryIds = entries.map((entry) => entry.id);
  const allIds = [
    ...DEFAULT_ROUTINES.map((routine) => routine.id),
    ...entryIds,
  ];
  const exerciseIds = new Set(LOCAL_EXERCISES.map((exercise) => exercise.id));
  assert.equal(entries.length, 109);
  assert.equal(new Set(entryIds).size, 109);
  assert.equal(new Set(allIds).size, 133);
  assert.equal(new Set(entries.map((entry) => entry.exerciseId)).size, 86);
  assert.equal(entries.filter((entry) => entry.prescriptionType === 'timed').length, 9);
  assert.ok(entries.every((entry) => exerciseIds.has(entry.exerciseId)));
  assert.ok(DEFAULT_ROUTINES.every((routine) => routine.ownership === 'default'));
  assert.ok(DEFAULT_ROUTINES.every((routine) => routine.description.trim().length > 0));
  assertRecursivelyFrozen(DEFAULT_ROUTINES);

  expectThrow(() => {
    DEFAULT_ROUTINES[0].name = 'Mutated';
  }, /read only|Cannot assign/);
  expectThrow(() => {
    DEFAULT_ROUTINES[0].exercises.push(DEFAULT_ROUTINES[0].exercises[0]);
  }, /extensible|read only|object is not extensible/i);
  expectThrow(() => {
    DEFAULT_ROUTINES[0].exercises[0].sets = 999;
  }, /read only|Cannot assign/);

  const acceptedClone = structuredClone(DEFAULT_ROUTINES);
  assert.equal(defineRoutineCatalog(acceptedClone, LOCAL_EXERCISES), acceptedClone);
  assertRecursivelyFrozen(acceptedClone, 'accepted catalog clone');

  function expectCatalogRejection(change, expectedMessage = /Routine|routine|catalog/) {
    const candidate = structuredClone(DEFAULT_ROUTINES);
    change(candidate);
    expectThrow(
      () => defineRoutineCatalog(candidate, LOCAL_EXERCISES),
      expectedMessage,
    );
  }

  const referenceCounts = countBy(entries, (entry) => entry.exerciseId);
  expectCatalogRejection((candidate) => candidate.pop(), /approved matrix/);
  expectCatalogRejection((candidate) => {
    candidate[0].description = '   ';
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].ownership = 'user';
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].estimatedDurationMinutes = 0;
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].order = 2;
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[1].id = candidate[0].exercises[0].id;
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].sets = 0;
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].targetDurationSeconds = 20;
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].restSeconds = -1;
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[4].exercises[1].notes = ' ';
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].description = 'A different valid description.';
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].targetReps += 1;
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].restSeconds += 1;
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    candidate[4].exercises[1].notes = 'Use a controlled unilateral tempo.';
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].notes = 'Keep each repetition controlled.';
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    delete candidate[0].exercises[0].restSeconds;
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    const firstExerciseId = candidate[0].exercises[0].exerciseId;
    candidate[0].exercises[0].exerciseId = candidate[0].exercises[1].exerciseId;
    candidate[0].exercises[1].exerciseId = firstExerciseId;
  }, /approved matrix/);
  const repeatedReferences = Object.entries(referenceCounts).filter(([, count]) => count > 1);
  assert.ok(repeatedReferences.length > 1);
  expectCatalogRejection((candidate) => {
    const [sourceExerciseId] = repeatedReferences[0];
    const [replacementExerciseId] = repeatedReferences.find(
      ([exerciseId]) => exerciseId !== sourceExerciseId,
    );
    const entry = candidate
      .flatMap((routine) => routine.exercises)
      .find((item) => item.exerciseId === sourceExerciseId);
    entry.exerciseId = replacementExerciseId;
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    [candidate[0], candidate[1]] = [candidate[1], candidate[0]];
  });
  expectCatalogRejection((candidate) => {
    const [firstEntry, secondEntry] = candidate[0].exercises;
    candidate[0].exercises[0] = {
      ...secondEntry,
      id: firstEntry.id,
      order: firstEntry.order,
    };
    candidate[0].exercises[1] = {
      ...firstEntry,
      id: secondEntry.id,
      order: secondEntry.order,
    };
  }, /approved matrix/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].exerciseId = 'not-a-canonical-exercise';
  }, /Invalid default routine/);
  expectCatalogRejection((candidate) => {
    candidate[0].exercises[0].exerciseId =
      candidate[0].exercises[0].exerciseId.toUpperCase();
  }, /Invalid default routine/);

  const uniquelyReferenced = entries.find(
    (entry) => referenceCounts[entry.exerciseId] === 1,
  );
  const repeatedReference = entries.find(
    (entry) => referenceCounts[entry.exerciseId] > 1,
  );
  assert.ok(uniquelyReferenced && repeatedReference);
  expectCatalogRejection((candidate) => {
    const entry = candidate
      .flatMap((routine) => routine.exercises)
      .find((item) => item.id === uniquelyReferenced.id);
    entry.exerciseId = repeatedReference.exerciseId;
  }, /aggregate totals/);

  const duplicateCanonicalIds = [...LOCAL_EXERCISES];
  duplicateCanonicalIds[1] = duplicateCanonicalIds[0];
  expectThrow(
    () => defineRoutineCatalog(structuredClone(DEFAULT_ROUTINES), duplicateCanonicalIds),
    /Canonical exercise IDs must be unique/,
  );

  const validUser = createUserRoutine(DEFAULT_ROUTINES[0], 'validator-user');
  assert.equal(routineTypes.isDefaultRoutine(DEFAULT_ROUTINES[0], exerciseIds), true);
  assert.equal(routineTypes.isUserRoutine(validUser, exerciseIds), true);
  assert.equal(
    routineTypes.isUserRoutine({ ...validUser, createdAt: 'not-an-iso-timestamp' }, exerciseIds),
    false,
  );
  assert.equal(
    routineTypes.isUserRoutine({ ...validUser, unexpected: true }, exerciseIds),
    false,
  );

  return {
    defaultRoutines: DEFAULT_ROUTINES,
    entryCount: entries.length,
    uniqueExerciseReferences: new Set(entries.map((entry) => entry.exerciseId)).size,
  };
}

async function verifyStorageAdapter(storageExports) {
  const calls = [];
  asyncStorageGetItem = async (key) => {
    calls.push(['getItem', key]);
    return 'stored-value';
  };
  asyncStorageSetItem = async (key, value) => {
    calls.push(['setItem', key, value]);
  };
  const adapter = storageExports.createAsyncStorageRoutineStorage('verification-key');
  assert.equal(await adapter.read(), 'stored-value');
  await adapter.write('next-value');
  assert.deepEqual(calls, [
    ['getItem', 'verification-key'],
    ['setItem', 'verification-key', 'next-value'],
  ]);
  assert.equal(storageExports.ROUTINE_STORAGE_KEY, '@oscar-fitness/routines/v1');
}

async function verifyPersistenceLoading(repositoryExports, defaultRoutines) {
  const { createLocalRoutineRepository } = repositoryExports;
  const absentStorage = createMemoryStorage();
  const absentRepository = createLocalRoutineRepository({ storage: absentStorage.storage });
  const defaultsOnly = await absentRepository.listRoutines();
  assert.deepEqual(defaultsOnly, defaultRoutines);
  assert.notEqual(defaultsOnly, defaultRoutines);
  assert.equal(absentStorage.readCount, 1);

  const validA = createUserRoutine(defaultRoutines[0], 'persisted-a');
  const validB = createUserRoutine(defaultRoutines[3], 'persisted-b');
  const validStorage = createMemoryStorage(serializeEnvelope([validA, validB]));
  const validRepository = createLocalRoutineRepository({ storage: validStorage.storage });
  const reconstructed = await validRepository.listRoutines();
  assert.deepEqual(reconstructed.slice(24), [validA, validB]);
  assert.notEqual(reconstructed[24], validA);
  assert.notEqual(reconstructed[24].exercises, validA.exercises);
  assert.equal(await validRepository.getRoutineById(defaultRoutines[0].id), defaultRoutines[0]);
  assert.deepEqual(await validRepository.getRoutineById(validA.id), validA);
  assert.equal(await validRepository.getRoutineById(validA.id.toUpperCase()), null);
  assert.equal(await validRepository.getRoutineById('unknown-routine'), null);

  let retryReadCount = 0;
  const retryRepository = createLocalRoutineRepository({
    storage: {
      async read() {
        retryReadCount += 1;
        if (retryReadCount === 1) {
          throw new Error('read failed once');
        }
        return serializeEnvelope([validA]);
      },
      async write() {},
    },
  });
  await expectReject(() => retryRepository.listRoutines(), /read failed once/);
  assert.deepEqual((await retryRepository.listRoutines()).slice(24), [validA]);
  assert.equal(retryReadCount, 2);

  const malformedValues = [
    '{',
    'null',
    '{}',
    JSON.stringify({ version: 1, userRoutines: [], extra: true }),
    JSON.stringify({ version: 2, userRoutines: [validA] }),
    JSON.stringify({ version: 1, userRoutines: {} }),
  ];
  for (const malformedValue of malformedValues) {
    const repository = createLocalRoutineRepository({
      storage: createMemoryStorage(malformedValue).storage,
    });
    assert.deepEqual(await repository.listRoutines(), defaultRoutines);
  }

  const blankName = { ...createUserRoutine(defaultRoutines[1], 'invalid-name'), name: ' ' };
  const unknownExercise = createUserRoutine(defaultRoutines[1], 'invalid-reference');
  unknownExercise.exercises[0].exerciseId = 'missing-exercise';
  const caseMismatchExercise = createUserRoutine(defaultRoutines[1], 'case-reference');
  caseMismatchExercise.exercises[0].exerciseId =
    caseMismatchExercise.exercises[0].exerciseId.toUpperCase();
  const unknownSource = createUserRoutine(defaultRoutines[1], 'invalid-source', {
    sourceRoutineId: 'missing-default',
  });
  const defaultRoutineCollision = createUserRoutine(defaultRoutines[1], defaultRoutines[0].id);
  const defaultEntryCollision = createUserRoutine(defaultRoutines[1], 'default-entry-collision');
  defaultEntryCollision.exercises[0].id = defaultRoutines[0].exercises[0].id;
  const userRoutineCollision = createUserRoutine(defaultRoutines[1], validA.id, {
    entryPrefix: 'user-routine-collision-entry',
  });
  const userEntryCollision = createUserRoutine(defaultRoutines[1], 'user-entry-collision');
  userEntryCollision.exercises[0].id = validA.exercises[0].id;
  const mixedStorage = createMemoryStorage(
    serializeEnvelope([
      validA,
      blankName,
      unknownExercise,
      caseMismatchExercise,
      unknownSource,
      defaultRoutineCollision,
      defaultEntryCollision,
      userRoutineCollision,
      userEntryCollision,
      validB,
    ]),
  );
  const mixedRepository = createLocalRoutineRepository({ storage: mixedStorage.storage });
  const mixedResults = await mixedRepository.listRoutines();
  assert.deepEqual(mixedResults.slice(24), [validA, validB]);
  assert.equal(mixedStorage.writes.length, 0);
  assert.deepEqual(defaultRoutines.map((routine) => routine.id), EXPECTED_ROUTINE_METADATA.map(([id]) => id));

  return { validA, validB };
}

async function verifyInvalidCopies(repositoryExports, defaultRoutines, persistedUser) {
  const { createLocalRoutineRepository } = repositoryExports;
  const sourceId = defaultRoutines[0].id;

  async function expectAtomicCopyFailure(options, expectedMessage) {
    const memory = createMemoryStorage(
      options.persisted ? serializeEnvelope([persistedUser]) : null,
    );
    const repository = createLocalRoutineRepository({
      storage: memory.storage,
      generateId: options.generateId,
      clock: options.clock ?? (() => new Date(FIXED_TIMESTAMP)),
    });
    await expectReject(() => repository.copyDefaultRoutine(sourceId), expectedMessage);
    assert.equal((await repository.listRoutines()).length, options.persisted ? 25 : 24);
    assert.equal(memory.writes.length, 0);
  }

  await expectAtomicCopyFailure({ generateId: () => '' }, /Generated routine copy is invalid/);
  await expectAtomicCopyFailure(
    { generateId: () => defaultRoutines[1].id },
    /Generated routine copy is invalid/,
  );
  let defaultEntryCall = 0;
  await expectAtomicCopyFailure(
    {
      generateId: () => {
        defaultEntryCall += 1;
        return defaultEntryCall === 1
          ? 'valid-new-routine-id'
          : defaultRoutines[1].exercises[0].id;
      },
    },
    /Generated routine copy is invalid/,
  );
  await expectAtomicCopyFailure(
    { generateId: () => 'duplicate-generated-id' },
    /Generated routine copy is invalid/,
  );
  await expectAtomicCopyFailure(
    { persisted: true, generateId: () => persistedUser.id },
    /Generated routine copy is invalid/,
  );
  let persistedEntryCall = 0;
  await expectAtomicCopyFailure(
    {
      persisted: true,
      generateId: () => {
        persistedEntryCall += 1;
        return persistedEntryCall === 1
          ? 'new-routine-before-entry-collision'
          : persistedUser.exercises[0].id;
      },
    },
    /Generated routine copy is invalid/,
  );
  await expectAtomicCopyFailure(
    { generateId: createIdGenerator('invalid-clock'), clock: () => new Date(Number.NaN) },
    /invalid date/,
  );
  await expectAtomicCopyFailure(
    { generateId: createIdGenerator('non-date-clock'), clock: () => FIXED_TIMESTAMP },
    /invalid date/,
  );

  const sourceMemory = createMemoryStorage();
  const sourceRepository = createLocalRoutineRepository({
    storage: sourceMemory.storage,
    generateId: createIdGenerator('source-check'),
    clock: () => new Date(FIXED_TIMESTAMP),
  });
  await expectReject(
    () => sourceRepository.copyDefaultRoutine('unknown-routine'),
    /Default routine not found/,
  );
  await expectReject(
    () => sourceRepository.copyDefaultRoutine(sourceId.toUpperCase()),
    /Default routine not found/,
  );
  const copied = await sourceRepository.copyDefaultRoutine(sourceId);
  const writesAfterCopy = sourceMemory.writes.length;
  await expectReject(
    () => sourceRepository.copyDefaultRoutine(copied.id),
    /Default routine not found/,
  );
  assert.equal(sourceMemory.writes.length, writesAfterCopy);
}

async function verifyConcurrentCopies(repositoryExports, defaultRoutines) {
  const pendingWrites = [];
  const storage = {
    async read() {
      return null;
    },
    write(value) {
      const operation = deferred();
      pendingWrites.push({ value, ...operation });
      return operation.promise;
    },
  };
  const repository = repositoryExports.createLocalRoutineRepository({
    storage,
    generateId: createIdGenerator('concurrent'),
    clock: () => new Date(FIXED_TIMESTAMP),
  });
  const firstCopyPromise = repository.copyDefaultRoutine(defaultRoutines[0].id);
  const secondCopyPromise = repository.copyDefaultRoutine(defaultRoutines[1].id);
  await waitFor(() => pendingWrites.length === 1, 'First concurrent copy did not begin writing');
  assert.equal(JSON.parse(pendingWrites[0].value).userRoutines.length, 1);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(pendingWrites.length, 1, 'Second copy wrote before the first commit settled');
  pendingWrites[0].resolve();
  const firstCopy = await firstCopyPromise;
  await waitFor(() => pendingWrites.length === 2, 'Second concurrent copy did not begin writing');
  const secondEnvelope = JSON.parse(pendingWrites[1].value);
  assert.equal(secondEnvelope.userRoutines.length, 2);
  assert.deepEqual(secondEnvelope.userRoutines.map((routine) => routine.id), [
    firstCopy.id,
    'concurrent-6',
  ]);
  pendingWrites[1].resolve();
  const secondCopy = await secondCopyPromise;
  assert.equal(secondCopy.id, 'concurrent-6');
  assert.deepEqual((await repository.listRoutines()).slice(24).map((routine) => routine.id), [
    firstCopy.id,
    secondCopy.id,
  ]);
}

async function verifyRollbackAndQueueRecovery(repositoryExports, defaultRoutines) {
  let value = null;
  let writeCount = 0;
  const repository = repositoryExports.createLocalRoutineRepository({
    storage: {
      async read() {
        return value;
      },
      async write(nextValue) {
        writeCount += 1;
        if (writeCount === 1) {
          throw new Error('simulated persistence failure');
        }
        value = nextValue;
      },
    },
    generateId: createIdGenerator('recovery'),
    clock: () => new Date(FIXED_TIMESTAMP),
  });
  await expectReject(
    () => repository.copyDefaultRoutine(defaultRoutines[0].id),
    /simulated persistence failure/,
  );
  assert.equal((await repository.listRoutines()).length, 24);
  assert.equal(await repository.getRoutineById('recovery-1'), null);

  const recoveredCopy = await repository.copyDefaultRoutine(defaultRoutines[0].id);
  assert.equal(recoveredCopy.id, 'recovery-6');
  assert.equal((await repository.listRoutines()).length, 25);
  assert.equal(writeCount, 2);
  assert.deepEqual(JSON.parse(value).userRoutines.map((routine) => routine.id), [
    recoveredCopy.id,
  ]);
}

async function verifyRepositoryCopies(repositoryExports, defaultRoutines) {
  const memory = createMemoryStorage();
  const repository = repositoryExports.createLocalRoutineRepository({
    storage: memory.storage,
    generateId: createIdGenerator('copy'),
    clock: () => new Date(FIXED_TIMESTAMP),
  });
  const source = defaultRoutines[0];
  const sourceBeforeCopy = structuredClone(source);
  const firstCopy = await repository.copyDefaultRoutine(source.id);
  assert.equal(firstCopy.id, 'copy-1');
  assert.equal(firstCopy.name, `${source.name} Copy`);
  assert.equal(firstCopy.ownership, 'user');
  assert.equal(firstCopy.sourceRoutineId, source.id);
  assert.equal(firstCopy.createdAt, FIXED_TIMESTAMP);
  assert.equal(firstCopy.updatedAt, FIXED_TIMESTAMP);
  assert.deepEqual(
    firstCopy.exercises.map(({ id, ...entry }) => entry),
    source.exercises.map(({ id, ...entry }) => entry),
  );
  assert.notEqual(firstCopy.exercises, source.exercises);
  assert.ok(firstCopy.exercises.every((entry, index) => entry !== source.exercises[index]));
  assert.deepEqual(source, sourceBeforeCopy);
  assertUserOnlyEnvelope(memory.value, 1, defaultRoutines);

  const pristineFirstCopy = structuredClone(firstCopy);
  firstCopy.name = 'Caller mutation';
  firstCopy.exercises[0].sets = 999;
  firstCopy.exercises.push({ ...firstCopy.exercises[0], id: 'caller-added-entry' });
  assert.deepEqual(await repository.getRoutineById(pristineFirstCopy.id), pristineFirstCopy);

  const secondCopy = await repository.copyDefaultRoutine(source.id);
  const pristineSecondCopy = structuredClone(secondCopy);
  const combinedIds = [
    ...defaultRoutines.flatMap((routine) => [
      routine.id,
      ...routine.exercises.map((entry) => entry.id),
    ]),
    ...[pristineFirstCopy, pristineSecondCopy].flatMap((routine) => [
      routine.id,
      ...routine.exercises.map((entry) => entry.id),
    ]),
  ];
  assert.equal(new Set(combinedIds).size, combinedIds.length);
  assert.notEqual(pristineFirstCopy.id, pristineSecondCopy.id);
  assert.notEqual(firstCopy.exercises[0], secondCopy.exercises[0]);
  assertUserOnlyEnvelope(memory.value, 2, defaultRoutines);

  const persistedBeforeCallerMutations = memory.value;
  secondCopy.description = 'Mutated second result';
  secondCopy.exercises[0].exerciseId = 'mutated-reference';
  assert.deepEqual(await repository.getRoutineById(pristineSecondCopy.id), pristineSecondCopy);
  assert.deepEqual(await repository.getRoutineById(pristineFirstCopy.id), pristineFirstCopy);
  assert.equal(memory.value, persistedBeforeCallerMutations);

  const firstList = await repository.listRoutines();
  assert.deepEqual(firstList.slice(0, 24), defaultRoutines);
  assert.deepEqual(firstList.slice(24), [pristineFirstCopy, pristineSecondCopy]);
  firstList.reverse();
  firstList.pop();
  const mutatedListUser = firstList.find((routine) => routine.id === pristineFirstCopy.id);
  mutatedListUser.name = 'Mutated list snapshot';
  mutatedListUser.exercises[0].sets = 777;
  const secondList = await repository.listRoutines();
  assert.deepEqual(secondList.slice(0, 24), defaultRoutines);
  assert.deepEqual(secondList.slice(24), [pristineFirstCopy, pristineSecondCopy]);
  assert.notEqual(firstList, secondList);

  const lookupSnapshot = await repository.getRoutineById(pristineFirstCopy.id);
  lookupSnapshot.exercises.length = 0;
  assert.deepEqual(await repository.getRoutineById(pristineFirstCopy.id), pristineFirstCopy);
  assert.equal(await repository.getRoutineById(pristineFirstCopy.id.toUpperCase()), null);

  const reconstructedRepository = repositoryExports.createLocalRoutineRepository({
    storage: memory.storage,
  });
  const reconstructedUsers = (await reconstructedRepository.listRoutines()).slice(24);
  assert.deepEqual(reconstructedUsers, [pristineFirstCopy, pristineSecondCopy]);
  assert.equal((await reconstructedRepository.listRoutines()).slice(0, 24).length, 24);
  assert.equal(memory.readCount, 2);

  await verifyInvalidCopies(repositoryExports, defaultRoutines, pristineFirstCopy);
  await verifyConcurrentCopies(repositoryExports, defaultRoutines);
  await verifyRollbackAndQueueRecovery(repositoryExports, defaultRoutines);

  return { copiedCount: reconstructedUsers.length };
}

async function verifyFiltering(filterExports, defaultRoutines) {
  const allFilters = { focus: 'All', level: 'All' };
  assert.deepEqual(filterExports.filterRoutines(defaultRoutines, allFilters), defaultRoutines);
  assert.notEqual(filterExports.filterRoutines(defaultRoutines, allFilters), defaultRoutines);
  assert.deepEqual(
    filterExports
      .filterRoutines(defaultRoutines, { focus: 'chest', level: 'advanced' })
      .map((routine) => routine.id),
    ['chest-strength-and-control'],
  );
  assert.deepEqual(
    filterExports
      .filterRoutines(defaultRoutines, { focus: 'full-body', level: 'All' })
      .map((routine) => routine.id),
    EXPECTED_ROUTINE_METADATA.filter(([, , focus]) => focus === 'full-body').map(([id]) => id),
  );
  assert.deepEqual(
    filterExports
      .filterRoutines(defaultRoutines, { focus: 'All', level: 'experienced' })
      .map((routine) => routine.id),
    ['experienced-total-body-strength'],
  );
  assert.deepEqual(
    filterExports.filterRoutines(defaultRoutines, {
      focus: 'shoulders',
      level: 'advanced',
    }),
    [],
  );

  const customOrder = [defaultRoutines[22], defaultRoutines[2], defaultRoutines[21]];
  assert.deepEqual(
    filterExports
      .filterRoutines(customOrder, { focus: 'All', level: 'advanced' })
      .map((routine) => routine.id),
    [defaultRoutines[22].id, defaultRoutines[2].id],
  );
  assert.deepEqual(
    filterExports.filterRoutines(defaultRoutines, {
      focus: 'Chest',
      level: 'beginner',
    }),
    [],
  );
}

async function verifyRoutineSessionProvider(defaultRoutines) {
  const { harness, sessionExports } = loadHookModules();
  const copyOperation = deferred();
  let copyCalls = 0;
  const repository = {
    async listRoutines() {
      return defaultRoutines;
    },
    async getRoutineById(id) {
      return defaultRoutines.find((routine) => routine.id === id) ?? null;
    },
    copyDefaultRoutine() {
      copyCalls += 1;
      return copyOperation.promise;
    },
  };
  const exerciseRepository = {
    async getExerciseById() {
      return null;
    },
  };
  const provider = harness.createRenderer(() =>
    sessionExports.RoutineSessionProvider({
      children: null,
      exerciseRepository,
      repository,
    }),
  );
  const child = harness.createRenderer(() => sessionExports.useRoutineSession());

  provider.render();
  let session = child.render();
  assert.equal(session.focus, 'All');
  assert.equal(session.level, 'All');
  session.setFocus('core');
  session.setLevel('advanced');

  for (const simulatedRoute of ['index', 'detail', 'index']) {
    provider.render();
    session = child.render();
    assert.equal(session.focus, 'core', `${simulatedRoute} rerender lost the focus filter`);
    assert.equal(session.level, 'advanced', `${simulatedRoute} rerender lost the level filter`);
  }

  session.resetFilters();
  provider.render();
  session = child.render();
  assert.equal(session.focus, 'All');
  assert.equal(session.level, 'All');

  const copiedRoutine = createUserRoutine(defaultRoutines[0], 'provider-copy');
  const firstCopy = session.copyDefaultRoutine(defaultRoutines[0].id);
  const duplicateCopy = session.copyDefaultRoutine(defaultRoutines[0].id);
  assert.equal(firstCopy, duplicateCopy);
  assert.equal(copyCalls, 1);
  assert.equal(child.render().revision, 0);
  copyOperation.resolve(copiedRoutine);
  assert.equal(await firstCopy, copiedRoutine);
  provider.render();
  assert.equal(child.render().revision, 1);

  const failedOperation = deferred();
  let failedCopyCalls = 0;
  const failedProvider = harness.createRenderer(() =>
    sessionExports.RoutineSessionProvider({
      children: null,
      exerciseRepository,
      repository: {
        ...repository,
        copyDefaultRoutine() {
          failedCopyCalls += 1;
          return failedOperation.promise;
        },
      },
    }),
  );
  failedProvider.render();
  const failedSession = child.render();
  const failedCopy = failedSession.copyDefaultRoutine(defaultRoutines[0].id);
  const failedAssertion = assert.rejects(failedCopy, /copy failed/);
  failedOperation.reject(new Error('copy failed'));
  await failedAssertion;
  failedProvider.render();
  assert.equal(child.render().revision, 0);
  assert.equal(failedCopyCalls, 1);

  const freshProvider = harness.createRenderer(() =>
    sessionExports.RoutineSessionProvider({
      children: null,
      exerciseRepository,
      repository,
    }),
  );
  freshProvider.render();
  assert.equal(child.render().focus, 'All');
  assert.equal(child.render().level, 'All');
}

function createDeferredRoutineRepository() {
  const listRequests = [];
  const detailRequests = [];
  return {
    detailRequests,
    listRequests,
    repository: {
      listRoutines() {
        const request = deferred();
        listRequests.push(request);
        return request.promise;
      },
      getRoutineById(id) {
        const request = deferred();
        detailRequests.push({ id, ...request });
        return request.promise;
      },
      async copyDefaultRoutine() {
        throw new Error('Copy is not used by this repository');
      },
    },
  };
}

async function settleHook(renderer, args, message) {
  let result = renderer.render(...args);
  for (let attempt = 0; result.state.status === 'loading' && attempt < 20; attempt += 1) {
    await flushAsyncWork();
    result = renderer.render(...args);
  }
  assert.notEqual(result.state.status, 'loading', message);
  return result;
}

async function verifyRoutineDataHooks(
  repositoryExports,
  defaultRoutines,
  exerciseCatalogExports,
) {
  const { dataExports, harness, sessionExports } = loadHookModules();
  const repositoryA = createDeferredRoutineRepository();
  const repositoryB = createDeferredRoutineRepository();
  const listHook = harness.createRenderer((repository, revision) =>
    dataExports.useRoutineList(repository, revision),
  );

  let listResult = listHook.render(repositoryA.repository, 0);
  assert.equal(listResult.state.status, 'loading');
  listResult.retry();
  listResult = listHook.render(repositoryA.repository, 0);
  assert.equal(repositoryA.listRequests.length, 2);
  listResult = listHook.render(repositoryA.repository, 1);
  assert.equal(repositoryA.listRequests.length, 3);
  listResult = listHook.render(repositoryB.repository, 1);
  assert.equal(repositoryB.listRequests.length, 1);

  repositoryA.listRequests[0].resolve([defaultRoutines[0]]);
  repositoryA.listRequests[1].resolve([defaultRoutines[1]]);
  repositoryA.listRequests[2].resolve([defaultRoutines[2]]);
  await flushAsyncWork();
  assert.equal(listHook.render(repositoryB.repository, 1).state.status, 'loading');
  repositoryB.listRequests[0].resolve([defaultRoutines[3]]);
  await flushAsyncWork();
  listResult = listHook.render(repositoryB.repository, 1);
  assert.equal(listResult.state.status, 'success');
  assert.deepEqual(listResult.state.data, [defaultRoutines[3]]);

  const detailHook = harness.createRenderer((repository, routineId, revision) =>
    dataExports.useRoutineDetail(repository, routineId, revision),
  );
  let detailResult = detailHook.render(repositoryA.repository, defaultRoutines[0].id, 0);
  detailResult.retry();
  detailHook.render(repositoryA.repository, defaultRoutines[0].id, 0);
  detailHook.render(repositoryA.repository, defaultRoutines[1].id, 0);
  detailHook.render(repositoryA.repository, defaultRoutines[1].id, 1);
  detailHook.render(repositoryB.repository, defaultRoutines[1].id, 1);
  assert.deepEqual(
    repositoryA.detailRequests.map(({ id }) => id),
    [
      defaultRoutines[0].id,
      defaultRoutines[0].id,
      defaultRoutines[1].id,
      defaultRoutines[1].id,
    ],
  );
  assert.equal(repositoryB.detailRequests.length, 1);

  for (const [index, request] of repositoryA.detailRequests.entries()) {
    request.resolve(defaultRoutines[index % 2]);
  }
  await flushAsyncWork();
  assert.equal(
    detailHook.render(repositoryB.repository, defaultRoutines[1].id, 1).state.status,
    'loading',
  );
  repositoryB.detailRequests[0].resolve(null);
  await flushAsyncWork();
  detailResult = detailHook.render(repositoryB.repository, defaultRoutines[1].id, 1);
  assert.equal(detailResult.state.status, 'success');
  assert.equal(detailResult.state.data, null);

  const retryRequests = [];
  const retryRepository = {
    getRoutineById() {
      const request = deferred();
      retryRequests.push(request);
      return request.promise;
    },
  };
  const retryDetailHook = harness.createRenderer((repository, routineId, revision) =>
    dataExports.useRoutineDetail(repository, routineId, revision),
  );
  detailResult = retryDetailHook.render(retryRepository, defaultRoutines[0].id, 0);
  retryRequests[0].reject(new Error('routine lookup failed'));
  await flushAsyncWork();
  detailResult = retryDetailHook.render(retryRepository, defaultRoutines[0].id, 0);
  assert.equal(detailResult.state.status, 'error');
  assert.match(detailResult.state.error.message, /routine lookup failed/);
  detailResult.retry();
  detailResult = retryDetailHook.render(retryRepository, defaultRoutines[0].id, 0);
  assert.equal(detailResult.state.status, 'loading');
  retryRequests[1].resolve(defaultRoutines[0]);
  await flushAsyncWork();
  detailResult = retryDetailHook.render(retryRepository, defaultRoutines[0].id, 0);
  assert.equal(detailResult.state.status, 'success');

  const exerciseById = new Map(
    exerciseCatalogExports.LOCAL_EXERCISES.map((exercise) => [exercise.id, exercise]),
  );
  const projectedRoutine = defaultRoutines[0];
  let routineLookupCount = 0;
  const resolvedRoutineRepository = {
    async getRoutineById() {
      routineLookupCount += 1;
      return projectedRoutine;
    },
  };
  const resolvedRoutineHook = harness.createRenderer((repository, routineId, revision) =>
    dataExports.useRoutineDetail(repository, routineId, revision),
  );
  detailResult = resolvedRoutineHook.render(resolvedRoutineRepository, projectedRoutine.id, 0);
  await flushAsyncWork();
  detailResult = resolvedRoutineHook.render(resolvedRoutineRepository, projectedRoutine.id, 0);
  assert.equal(detailResult.state.status, 'success');

  let activeProjectionAttempt;
  const exerciseRepository = {
    getExerciseById(exerciseId) {
      const request = deferred();
      activeProjectionAttempt.set(exerciseId, request);
      return request.promise;
    },
  };
  const projectionHook = harness.createRenderer((repository, routine) =>
    dataExports.useRoutineExerciseProjection(repository, routine),
  );
  activeProjectionAttempt = new Map();
  let projectionResult = projectionHook.render(exerciseRepository, projectedRoutine);
  assert.equal(projectionResult.state.status, 'loading');
  activeProjectionAttempt.get(projectedRoutine.exercises[0].exerciseId).reject(
    new Error('exercise lookup failed'),
  );
  await flushAsyncWork();
  projectionResult = projectionHook.render(exerciseRepository, projectedRoutine);
  assert.equal(projectionResult.state.status, 'error');
  assert.equal(detailResult.state.status, 'success');

  activeProjectionAttempt = new Map();
  projectionResult.retry();
  projectionResult = projectionHook.render(exerciseRepository, projectedRoutine);
  assert.equal(projectionResult.state.status, 'loading');
  assert.equal(routineLookupCount, 1);
  for (const [exerciseId, request] of activeProjectionAttempt) {
    request.resolve(exerciseById.get(exerciseId));
  }
  await flushAsyncWork();
  projectionResult = projectionHook.render(exerciseRepository, projectedRoutine);
  assert.equal(projectionResult.state.status, 'success');
  assert.deepEqual(
    projectionResult.state.data.map(({ routineExercise, exercise }) => [
      routineExercise.id,
      exercise.id,
    ]),
    projectedRoutine.exercises.map((entry) => [entry.id, entry.exerciseId]),
  );
  assert.equal(routineLookupCount, 1);

  const missingId = projectedRoutine.exercises[1].exerciseId;
  const missingRepository = {
    async getExerciseById(exerciseId) {
      return exerciseId === missingId ? null : exerciseById.get(exerciseId);
    },
  };
  const stableMissingProjectionHook = harness.createRenderer((repository, routine) =>
    dataExports.useRoutineExerciseProjection(repository, routine),
  );
  stableMissingProjectionHook.render(missingRepository, projectedRoutine);
  await flushAsyncWork();
  projectionResult = stableMissingProjectionHook.render(missingRepository, projectedRoutine);
  assert.equal(projectionResult.state.status, 'missing-reference');
  assert.deepEqual(projectionResult.state.exerciseIds, [missingId]);

  const memory = createMemoryStorage();
  const localRepository = repositoryExports.createLocalRoutineRepository({
    storage: memory.storage,
    generateId: createIdGenerator('session-copy'),
    clock: () => new Date(FIXED_TIMESTAMP),
  });
  const localExerciseRepository = {
    async getExerciseById(exerciseId) {
      return exerciseById.get(exerciseId) ?? null;
    },
  };
  const provider = harness.createRenderer(() =>
    sessionExports.RoutineSessionProvider({
      children: null,
      exerciseRepository: localExerciseRepository,
      repository: localRepository,
    }),
  );
  const sessionChild = harness.createRenderer(() => sessionExports.useRoutineSession());
  const localListHook = harness.createRenderer((repository, revision) =>
    dataExports.useRoutineList(repository, revision),
  );
  provider.render();
  let session = sessionChild.render();
  let localList = await settleHook(
    localListHook,
    [localRepository, session.revision],
    'Initial local routine list did not settle',
  );
  assert.equal(localList.state.status, 'success');
  assert.equal(localList.state.data.length, 24);

  const copiedRoutine = await session.copyDefaultRoutine(defaultRoutines[0].id);
  provider.render();
  session = sessionChild.render();
  assert.equal(session.revision, 1);
  assert.equal(localListHook.render(localRepository, session.revision).state.status, 'loading');
  localList = await settleHook(
    localListHook,
    [localRepository, session.revision],
    'Post-copy local routine list did not settle',
  );
  assert.equal(localList.state.status, 'success');
  assert.equal(localList.state.data.length, 25);
  assert.equal(localList.state.data.at(-1).id, copiedRoutine.id);

  const localDetailHook = harness.createRenderer((repository, routineId, revision) =>
    dataExports.useRoutineDetail(repository, routineId, revision),
  );
  let localDetail = await settleHook(
    localDetailHook,
    [localRepository, copiedRoutine.id, session.revision],
    'Copied routine detail did not settle',
  );
  assert.equal(localDetail.state.status, 'success');
  assert.deepEqual(localDetail.state.data, copiedRoutine);
  localDetail = await settleHook(
    localDetailHook,
    [localRepository, 'runtime-unknown-routine', session.revision],
    'Unknown routine detail did not settle',
  );
  assert.equal(localDetail.state.status, 'success');
  assert.equal(localDetail.state.data, null);

  const reconstructedRepository = repositoryExports.createLocalRoutineRepository({
    storage: memory.storage,
  });
  const reconstructedDetailHook = harness.createRenderer((repository, routineId, revision) =>
    dataExports.useRoutineDetail(repository, routineId, revision),
  );
  const reconstructedDetail = await settleHook(
    reconstructedDetailHook,
    [reconstructedRepository, copiedRoutine.id, 0],
    'Reconstructed copied routine detail did not settle',
  );
  assert.equal(reconstructedDetail.state.status, 'success');
  assert.deepEqual(reconstructedDetail.state.data, copiedRoutine);
  assertUserOnlyEnvelope(memory.value, 1, defaultRoutines);
}

function createRoutineRouteHarness(defaultRoutines) {
  const { dataExports, harness } = loadHookModules();
  const environment = {
    params: {},
    replaceCalls: [],
    session: null,
  };
  const router = {
    replace(destination) {
      environment.replaceCalls.push(destination);
    },
  };
  const routeExports = executeCommonJs(
    readFileSync(ROUTINE_ROUTE_PATH, 'utf8'),
    ROUTINE_ROUTE_PATH,
    (request) => {
      if (request === 'react') {
        return harness.react;
      }
      if (request === 'react/jsx-runtime') {
        return harness.jsxRuntime;
      }
      if (request === 'expo-router') {
        return {
          useLocalSearchParams: () => environment.params,
          useRouter: () => router,
        };
      }
      if (request.endsWith('/routine-detail')) {
        return {
          RoutineDetail: (props) => ({ component: 'RoutineDetail', props }),
        };
      }
      if (request.endsWith('/routine-state-panel')) {
        return {
          RoutineStatePanel: (props) => ({ component: 'RoutineStatePanel', props }),
        };
      }
      if (request.endsWith('/section-screen')) {
        return {
          SectionScreen: (props) => ({ component: 'SectionScreen', props }),
        };
      }
      if (request.endsWith('/routine-catalog')) {
        return { DEFAULT_ROUTINES: defaultRoutines };
      }
      if (request.endsWith('/routine-session')) {
        return { useRoutineSession: () => environment.session };
      }
      if (request.endsWith('/use-routine-data')) {
        return dataExports;
      }
      return {};
    },
  );
  const renderer = harness.createRenderer(() => routeExports.default());

  return { environment, renderer };
}

async function settleRoute(renderer, predicate, message) {
  let result = renderer.render();
  for (let attempt = 0; !predicate(result) && attempt < 20; attempt += 1) {
    await flushAsyncWork();
    result = renderer.render();
  }
  assert.ok(predicate(result), message);
  return result;
}

async function verifyRoutineRouteRuntime(
  repositoryExports,
  defaultRoutines,
  exerciseCatalogExports,
) {
  const exerciseById = new Map(
    exerciseCatalogExports.LOCAL_EXERCISES.map((exercise) => [exercise.id, exercise]),
  );
  const exerciseRepository = {
    async getExerciseById(exerciseId) {
      return exerciseById.get(exerciseId) ?? null;
    },
  };

  const memory = createMemoryStorage();
  const sourceRepository = repositoryExports.createLocalRoutineRepository({
    storage: memory.storage,
    generateId: createIdGenerator('route-persisted-copy'),
    clock: () => new Date(FIXED_TIMESTAMP),
  });
  const persistedCopy = await sourceRepository.copyDefaultRoutine(defaultRoutines[0].id);
  const reconstructedRepository = repositoryExports.createLocalRoutineRepository({
    storage: memory.storage,
  });
  const persistedRoute = createRoutineRouteHarness(defaultRoutines);
  persistedRoute.environment.params = { routineId: persistedCopy.id };
  persistedRoute.environment.session = {
    copyDefaultRoutine: (id) => reconstructedRepository.copyDefaultRoutine(id),
    exerciseRepository,
    repository: reconstructedRepository,
    revision: 0,
  };
  let routeResult = await settleRoute(
    persistedRoute.renderer,
    (result) =>
      result.component === 'RoutineDetail' && result.props.exerciseState.status === 'success',
    'Persisted user ID did not resolve through RoutineDetailRoute',
  );
  assert.deepEqual(routeResult.props.routine, persistedCopy);
  assert.equal(routeResult.props.routine.ownership, 'user');

  persistedRoute.environment.params = { routineId: 'runtime-unknown-routine' };
  routeResult = await settleRoute(
    persistedRoute.renderer,
    (result) => result.component === 'SectionScreen' && result.props.title === 'Routine not found',
    'Unknown runtime ID did not reach the route not-found presentation',
  );
  assert.equal(
    routeResult.props.description,
    'This routine ID is not available in the bundled catalog or saved routines.',
  );

  const copyOperation = deferred();
  const successfulCopy = createUserRoutine(defaultRoutines[0], 'route-copy-success');
  let copyCalls = 0;
  const copyRoute = createRoutineRouteHarness(defaultRoutines);
  copyRoute.environment.params = { routineId: defaultRoutines[0].id };
  copyRoute.environment.session = {
    copyDefaultRoutine(id) {
      copyCalls += 1;
      assert.equal(id, defaultRoutines[0].id);
      return copyOperation.promise;
    },
    exerciseRepository,
    repository: {
      async getRoutineById(id) {
        return id === defaultRoutines[0].id ? defaultRoutines[0] : null;
      },
    },
    revision: 0,
  };
  routeResult = await settleRoute(
    copyRoute.renderer,
    (result) => result.component === 'RoutineDetail',
    'Default routine did not resolve through RoutineDetailRoute',
  );
  const firstCopy = routeResult.props.onCopy();
  const duplicateCopy = routeResult.props.onCopy();
  assert.equal(copyCalls, 1);
  await flushAsyncWork();
  assert.deepEqual(copyRoute.environment.replaceCalls, []);
  copyOperation.resolve(successfulCopy);
  await Promise.all([firstCopy, duplicateCopy]);
  assert.deepEqual(copyRoute.environment.replaceCalls, [
    {
      pathname: '/routines/[routineId]',
      params: { routineId: successfulCopy.id },
    },
  ]);

  const failedCopyOperation = deferred();
  let failedCopyCalls = 0;
  const failedCopyRoute = createRoutineRouteHarness(defaultRoutines);
  failedCopyRoute.environment.params = { routineId: defaultRoutines[0].id };
  failedCopyRoute.environment.session = {
    copyDefaultRoutine() {
      failedCopyCalls += 1;
      return failedCopyOperation.promise;
    },
    exerciseRepository,
    repository: {
      async getRoutineById(id) {
        return id === defaultRoutines[0].id ? defaultRoutines[0] : null;
      },
    },
    revision: 0,
  };
  routeResult = await settleRoute(
    failedCopyRoute.renderer,
    (result) => result.component === 'RoutineDetail',
    'Default routine for failed copy did not resolve through RoutineDetailRoute',
  );
  const failedCopy = routeResult.props.onCopy();
  failedCopyOperation.reject(new Error('route copy failed'));
  await failedCopy;
  assert.equal(failedCopyCalls, 1);
  assert.deepEqual(failedCopyRoute.environment.replaceCalls, []);
}

async function verifyStaticParams(defaultRoutines) {
  const routeSource = await readFile(ROUTINE_ROUTE_PATH, 'utf8');
  const routeExports = executeCommonJs(routeSource, ROUTINE_ROUTE_PATH, (request) => {
    if (request.endsWith('/routine-catalog')) {
      return { DEFAULT_ROUTINES: defaultRoutines };
    }
    if (request === 'react/jsx-runtime') {
      return { Fragment: Symbol('Fragment'), jsx: () => null, jsxs: () => null };
    }
    return {};
  });
  const staticParams = routeExports.generateStaticParams();
  assert.deepEqual(
    staticParams,
    defaultRoutines.map((routine) => ({ routineId: routine.id })),
  );
  assert.equal(new Set(staticParams.map(({ routineId }) => routineId)).size, 24);
  assert.ok(staticParams.every(({ routineId }) => !routineId.startsWith('copy-')));
  return staticParams.length;
}

async function verifyPresentation(
  defaultRoutines,
  exerciseCatalogExports,
  routineTypes,
  exerciseTypes,
) {
  const [cardSource, detailSource] = await Promise.all([
    readFile(ROUTINE_CARD_PATH, 'utf8'),
    readFile(ROUTINE_DETAIL_PATH, 'utf8'),
  ]);
  const componentRequire = createPresentationRequire(routineTypes, exerciseTypes);
  const { RoutineCard } = executeCommonJs(
    cardSource,
    ROUTINE_CARD_PATH,
    componentRequire,
  );
  const { RoutineDetail } = executeCommonJs(
    detailSource,
    ROUTINE_DETAIL_PATH,
    componentRequire,
  );

  const defaultRoutine = defaultRoutines[0];
  const defaultCardMarkup = renderToStaticMarkup(
    React.createElement(RoutineCard, { routine: defaultRoutine, onPress: () => {} }),
  );
  for (const label of [
    defaultRoutine.name,
    'Chest',
    'Beginner',
    'Default',
    '4 exercises',
    '30 min',
    'View routine',
    `Open ${defaultRoutine.name}.`,
  ]) {
    assert.ok(defaultCardMarkup.includes(label), `Routine card omitted: ${label}`);
  }

  const exerciseById = new Map(
    exerciseCatalogExports.LOCAL_EXERCISES.map((exercise) => [exercise.id, exercise]),
  );
  const detailRoutine = defaultRoutines.find(
    (routine) => routine.id === 'core-stability-basics',
  );
  const projection = detailRoutine.exercises.map((routineExercise) => ({
    routineExercise,
    exercise: exerciseById.get(routineExercise.exerciseId),
  }));
  const defaultDetailMarkup = renderToStaticMarkup(
    React.createElement(RoutineDetail, {
      routine: detailRoutine,
      exerciseState: { status: 'success', data: projection },
      onRetryExercises: () => {},
      copyPending: false,
      copyError: null,
      onCopy: () => {},
    }),
  );
  for (const label of [
    detailRoutine.name,
    'Default',
    'Core',
    'Beginner',
    '20 min estimate',
    'Make it yours',
    'Copy routine',
    'Ordered prescription',
    '2 sets x 8 reps',
    '3 sets x 20 seconds',
    'Rest: 45 seconds',
    'Notes: Reps per side.',
    'View exercise',
  ]) {
    assert.ok(defaultDetailMarkup.includes(label), `Routine detail omitted: ${label}`);
  }
  for (const entry of detailRoutine.exercises) {
    assert.ok(defaultDetailMarkup.includes(`href="/exercises/${entry.exerciseId}"`));
    assert.ok(defaultDetailMarkup.includes(exerciseById.get(entry.exerciseId).name));
  }

  const minimalUser = createUserRoutine(defaultRoutines[0], 'user-without-options', {
    includeEstimate: false,
    includeSource: false,
  });
  minimalUser.exercises = [
    {
      id: 'user-without-options-entry-1',
      order: 1,
      exerciseId: defaultRoutines[0].exercises[0].exerciseId,
      sets: 1,
      prescriptionType: 'reps',
      targetReps: 5,
    },
  ];
  const userCardMarkup = renderToStaticMarkup(
    React.createElement(RoutineCard, { routine: minimalUser, onPress: () => {} }),
  );
  assert.ok(userCardMarkup.includes('User'));
  assert.ok(userCardMarkup.includes('1 exercises'));
  assert.ok(!/\d+ min/.test(userCardMarkup));

  const userDetailMarkup = renderToStaticMarkup(
    React.createElement(RoutineDetail, {
      routine: minimalUser,
      exerciseState: {
        status: 'success',
        data: [
          {
            routineExercise: minimalUser.exercises[0],
            exercise: exerciseById.get(minimalUser.exercises[0].exerciseId),
          },
        ],
      },
      onRetryExercises: () => {},
      copyPending: false,
      copyError: null,
      onCopy: () => {},
    }),
  );
  assert.ok(userDetailMarkup.includes('User'));
  assert.ok(userDetailMarkup.includes('1 sets x 5 reps'));
  for (const omittedLabel of [
    'min estimate',
    'Rest:',
    'Notes:',
    'Copy routine',
    'Make it yours',
    'Source routine',
  ]) {
    assert.ok(!userDetailMarkup.includes(omittedLabel), `Unexpected optional label: ${omittedLabel}`);
  }
}

async function collectHtmlFiles(directory, relativeDirectory = '') {
  const entries = await readdir(path.join(directory, relativeDirectory), {
    withFileTypes: true,
  });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(directory, relativePath)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(relativePath.split(path.sep).join('/'));
    }
  }

  return files;
}

async function verifyStaticExport(defaultRoutines) {
  const appConfig = JSON.parse(await readFile(APP_CONFIG_PATH, 'utf8'));
  assert.equal(appConfig.expo?.web?.output, 'static');

  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), 'oscar-routine-export-'));
  try {
    const exportResult = spawnSync(
      'pnpm',
      [
        'exec',
        'expo',
        'export',
        '--platform',
        'web',
        '--output-dir',
        outputDirectory,
      ],
      {
        cwd: ROOT_DIR,
        env: { ...process.env, CI: '1' },
        stdio: 'inherit',
      },
    );
    assert.equal(
      exportResult.status,
      0,
      exportResult.error?.message ?? `Expo export exited with status ${exportResult.status}`,
    );

    const htmlFiles = (await collectHtmlFiles(outputDirectory)).sort();
    const expectedDefaultPages = defaultRoutines
      .map((routine) => `routines/${routine.id}.html`)
      .sort();
    const expectedRoutinePages = [
      ...expectedDefaultPages,
      'routines/[routineId].html',
      'routines/index.html',
    ].sort();
    const routinePages = htmlFiles.filter((file) => file.startsWith('routines/')).sort();

    assert.deepEqual(routinePages, expectedRoutinePages);
    assert.ok(expectedDefaultPages.every((file) => htmlFiles.includes(file)));
    assert.ok(!htmlFiles.includes('routines/verification-user-copy.html'));
    assert.ok(htmlFiles.includes('index.html'));
  } finally {
    await rm(outputDirectory, { force: true, recursive: true });
  }
}

async function main() {
  const moduleCache = new Map();
  const routineTypes = loadTypeScriptModule(ROUTINE_TYPES_PATH, moduleCache);
  const exerciseTypes = loadTypeScriptModule(EXERCISE_TYPES_PATH, moduleCache);
  const exerciseCatalogExports = loadTypeScriptModule(EXERCISE_CATALOG_PATH, moduleCache);
  const catalogExports = loadTypeScriptModule(ROUTINE_CATALOG_PATH, moduleCache);
  const storageExports = loadTypeScriptModule(ROUTINE_STORAGE_PATH, moduleCache);
  const repositoryExports = loadTypeScriptModule(ROUTINE_REPOSITORY_PATH, moduleCache);
  const filterExports = loadTypeScriptModule(ROUTINE_FILTER_PATH, moduleCache);

  const catalogResult = await verifyCatalog(
    catalogExports,
    exerciseCatalogExports,
    routineTypes,
  );
  await verifyStorageAdapter(storageExports);
  const { validA } = await verifyPersistenceLoading(
    repositoryExports,
    catalogResult.defaultRoutines,
  );
  assert.ok(validA);
  const repositoryResult = await verifyRepositoryCopies(
    repositoryExports,
    catalogResult.defaultRoutines,
  );
  await verifyFiltering(filterExports, catalogResult.defaultRoutines);
  await verifyRoutineSessionProvider(catalogResult.defaultRoutines);
  await verifyRoutineDataHooks(
    repositoryExports,
    catalogResult.defaultRoutines,
    exerciseCatalogExports,
  );
  await verifyRoutineRouteRuntime(
    repositoryExports,
    catalogResult.defaultRoutines,
    exerciseCatalogExports,
  );
  const staticParamCount = await verifyStaticParams(catalogResult.defaultRoutines);
  await verifyPresentation(
    catalogResult.defaultRoutines,
    exerciseCatalogExports,
    routineTypes,
    exerciseTypes,
  );
  const exportVerified = process.argv.includes('--export');
  if (exportVerified) {
    await verifyStaticExport(catalogResult.defaultRoutines);
  }

  console.log('Routine feature verification passed.');
  console.log(
    JSON.stringify(
      {
        defaultRoutines: catalogResult.defaultRoutines.length,
        entries: catalogResult.entryCount,
        uniqueExerciseReferences: catalogResult.uniqueExerciseReferences,
        timedEntries: 9,
        reconstructedCopies: repositoryResult.copiedCount,
        staticParams: staticParamCount,
        providerAndHooks: true,
        runtimeRouteAdapter: true,
        staticExport: exportVerified,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
