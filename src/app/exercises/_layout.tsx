import { Stack } from 'expo-router';

import { ExerciseSessionProvider } from '@/features/exercises/exercise-session';
import { useTheme } from '@/hooks/use-theme';

export default function ExercisesLayout() {
  const theme = useTheme();

  return (
    <ExerciseSessionProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.background },
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="[exerciseId]"
          options={{
            title: '',
            headerBackTitle: 'Exercises',
          }}
        />
      </Stack>
    </ExerciseSessionProvider>
  );
}
