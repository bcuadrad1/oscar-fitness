import { type Href, useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { RoutineCard } from '@/components/routines/routine-card';
import { RoutineFilters } from '@/components/routines/routine-filters';
import { RoutineStatePanel } from '@/components/routines/routine-state-panel';
import { SectionScreen } from '@/components/section-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { filterRoutines } from '@/features/routines/filter-routines';
import { useRoutineSession } from '@/features/routines/routine-session';
import { useRoutineList } from '@/features/routines/use-routine-data';

export default function RoutinesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const session = useRoutineSession();
  const { state, retry } = useRoutineList(session.repository, session.revision);
  const filteredRoutines =
    state.status === 'success'
      ? filterRoutines(state.data, { focus: session.focus, level: session.level })
      : [];
  const useWideCards = width >= 760;

  return (
    <SectionScreen
      eyebrow="Training plans"
      title="Routines"
      description="Browse complete training templates by focus and level, then open an ordered prescription or save a personal copy.">
      {state.status === 'loading' && (
        <RoutineStatePanel
          title="Loading routine library"
          description="Initializing local storage and preparing bundled and saved routines."
          loading
        />
      )}

      {state.status === 'error' && (
        <RoutineStatePanel
          title="Routine library unavailable"
          description="The local routine repository could not be initialized or read. Try the request again."
          actionLabel="Retry library"
          onAction={retry}
          accessibilityRole="alert"
        />
      )}

      {state.status === 'success' && (
        <>
          <RoutineFilters
            focus={session.focus}
            onFocusChange={session.setFocus}
            level={session.level}
            onLevelChange={session.setLevel}
            onReset={session.resetFilters}
          />

          <View style={styles.resultsHeading}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Showing {filteredRoutines.length} of {state.data.length} routines
            </ThemedText>
          </View>

          {filteredRoutines.length === 0 ? (
            <RoutineStatePanel
              title="No routines found"
              description="No routine matches both active filters. Reset them to see the full library."
              actionLabel="Reset filters"
              onAction={session.resetFilters}
            />
          ) : (
            <View style={styles.cards}>
              {filteredRoutines.map((routine) => (
                <View
                  key={routine.id}
                  style={[styles.cardSlot, useWideCards && styles.cardSlotWide]}>
                  <RoutineCard
                    routine={routine}
                    onPress={() =>
                      router.push({
                        pathname: '/routines/[routineId]',
                        params: { routineId: routine.id },
                      } as unknown as Href)
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </SectionScreen>
  );
}

const styles = StyleSheet.create({
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  cardSlot: {
    width: '100%',
  },
  cardSlotWide: {
    width: '48%',
    flexGrow: 1,
  },
});
