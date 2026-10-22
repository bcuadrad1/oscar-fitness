import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  getRoutineFocusLabel,
  getRoutineLevelLabel,
  ROUTINE_FOCUS_FILTERS,
  ROUTINE_LEVEL_FILTERS,
  type RoutineFocusFilter,
  type RoutineLevelFilter,
} from '@/features/routines/routine-types';
import { useTheme } from '@/hooks/use-theme';

type RoutineFiltersProps = {
  focus: RoutineFocusFilter;
  onFocusChange: (value: RoutineFocusFilter) => void;
  level: RoutineLevelFilter;
  onLevelChange: (value: RoutineLevelFilter) => void;
  onReset: () => void;
};

export function RoutineFilters({
  focus,
  onFocusChange,
  level,
  onLevelChange,
  onReset,
}: RoutineFiltersProps) {
  const theme = useTheme();
  const hasActiveFilters = focus !== 'All' || level !== 'All';

  return (
    <View style={styles.controls}>
      <View style={styles.heading}>
        <ThemedText type="subtitle" style={styles.title}>
          Refine routines
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset routine filters"
          accessibilityState={{ disabled: !hasActiveFilters }}
          disabled={!hasActiveFilters}
          onPress={onReset}
          style={({ pressed }) => [
            styles.reset,
            { borderColor: theme.border },
            pressed && styles.pressed,
            !hasActiveFilters && styles.disabled,
          ]}>
          <ThemedText type="smallBold" themeColor="accent">
            Reset filters
          </ThemedText>
        </Pressable>
      </View>

      <FilterGroup
        label="Focus"
        values={ROUTINE_FOCUS_FILTERS}
        selectedValue={focus}
        onChange={onFocusChange}
        getLabel={getRoutineFocusLabel}
      />
      <FilterGroup
        label="Level"
        values={ROUTINE_LEVEL_FILTERS}
        selectedValue={level}
        onChange={onLevelChange}
        getLabel={getRoutineLevelLabel}
      />
    </View>
  );
}

type FilterGroupProps<T extends string> = {
  label: string;
  values: readonly T[];
  selectedValue: T;
  onChange: (value: T) => void;
  getLabel: (value: T) => string;
};

function FilterGroup<T extends string>({
  label,
  values,
  selectedValue,
  onChange,
  getLabel,
}: FilterGroupProps<T>) {
  const theme = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={`${label} filters`} style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.filterRow}>
        {values.map((value) => {
          const isSelected = value === selectedValue;
          const valueLabel = getLabel(value);

          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={`${valueLabel} ${label.toLowerCase()} filter`}
              accessibilityState={{ checked: isSelected }}
              aria-checked={isSelected}
              onPress={() => onChange(value)}
              style={({ pressed }) => [
                styles.filter,
                {
                  backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText type="smallBold" themeColor={isSelected ? 'text' : 'textSecondary'}>
                {valueLabel}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  reset: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  field: {
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  filter: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.45,
  },
});
