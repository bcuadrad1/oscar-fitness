import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { RoutineSessionProvider } from '@/features/routines/routine-session';
import type {
  RoutineFocusFilter,
  RoutineLevelFilter,
} from '@/features/routines/routine-types';
import { useTheme } from '@/hooks/use-theme';

let webFocus: RoutineFocusFilter = 'All';
let webLevel: RoutineLevelFilter = 'All';

export default function RoutinesLayout() {
  const theme = useTheme();

  const stack = (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[routineId]"
        options={{
          title: '',
          headerBackTitle: 'Routines',
        }}
      />
    </Stack>
  );

  return (
    <RoutineSessionProvider
      initialFocus={Platform.OS === 'web' ? webFocus : undefined}
      initialLevel={Platform.OS === 'web' ? webLevel : undefined}
      onFocusChange={Platform.OS === 'web' ? (value) => (webFocus = value) : undefined}
      onLevelChange={Platform.OS === 'web' ? (value) => (webLevel = value) : undefined}>
      {stack}
    </RoutineSessionProvider>
  );
}
