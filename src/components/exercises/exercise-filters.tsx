import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  EXERCISE_BODY_AREA_FILTERS,
  EXERCISE_DIFFICULTY_FILTERS,
  type ExerciseBodyAreaFilter,
  type ExerciseDifficultyFilter,
} from '@/features/exercises/exercise-types';
import { useTheme } from '@/hooks/use-theme';

type ExerciseFiltersProps = {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  bodyArea: ExerciseBodyAreaFilter;
  onBodyAreaChange: (value: ExerciseBodyAreaFilter) => void;
  difficulty: ExerciseDifficultyFilter;
  onDifficultyChange: (value: ExerciseDifficultyFilter) => void;
};

export function ExerciseFilters({
  searchText,
  onSearchTextChange,
  bodyArea,
  onBodyAreaChange,
  difficulty,
  onDifficultyChange,
}: ExerciseFiltersProps) {
  const theme = useTheme();

  return (
    <View style={styles.controls}>
      <View style={styles.field}>
        <ThemedText type="smallBold">Search by exercise name</ThemedText>
        <TextInput
          accessibilityLabel="Search exercises by name"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          enterKeyHint="search"
          value={searchText}
          onChangeText={onSearchTextChange}
          placeholder="Try Bodyweight Squat"
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.accent}
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
        />
      </View>

      <FilterGroup
        label="Body area"
        values={EXERCISE_BODY_AREA_FILTERS}
        selectedValue={bodyArea}
        onChange={onBodyAreaChange}
      />
      <FilterGroup
        label="Difficulty"
        values={EXERCISE_DIFFICULTY_FILTERS}
        selectedValue={difficulty}
        onChange={onDifficultyChange}
      />
    </View>
  );
}

type FilterGroupProps<T extends string> = {
  label: string;
  values: readonly T[];
  selectedValue: T;
  onChange: (value: T) => void;
};

function FilterGroup<T extends string>({
  label,
  values,
  selectedValue,
  onChange,
}: FilterGroupProps<T>) {
  const theme = useTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={`${label} filters`} style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.filterRow}>
        {values.map((value) => {
          const isSelected = value === selectedValue;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={`${value} ${label.toLowerCase()} filter`}
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
                {value}
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
  field: {
    gap: Spacing.two,
  },
  searchInput: {
    minHeight: 50,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.two,
    fontSize: 16,
    fontWeight: '500',
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
});
