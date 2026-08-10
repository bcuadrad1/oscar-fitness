import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  formatExerciseEquipment,
  getExerciseDifficultyLabel,
  type Exercise,
} from '@/features/exercises/exercise-types';
import { useTheme } from '@/hooks/use-theme';

type ExerciseCardProps = {
  exercise: Exercise;
  onPress: () => void;
};

export function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const difficultyLabel = getExerciseDifficultyLabel(exercise.difficulty);
  const equipmentLabel = formatExerciseEquipment(exercise.equipmentIds);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${exercise.name}. ${exercise.targetBodyArea}, ${difficultyLabel}, ${equipmentLabel}.`}
      accessibilityHint="Opens exercise instructions and video details"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.thumbnailFrame, { backgroundColor: theme.backgroundSelected }]}>
        {imageFailed ? (
          <View accessibilityRole="image" accessibilityLabel={exercise.thumbnail.alt} style={styles.fallback}>
            <View style={[styles.fallbackMark, { backgroundColor: theme.accent }]} />
            <ThemedText type="smallBold">Image unavailable</ThemedText>
          </View>
        ) : (
          <Image
            source={exercise.thumbnail.source}
            accessibilityLabel={exercise.thumbnail.alt}
            contentFit="cover"
            transition={150}
            onError={() => setImageFailed(true)}
            style={styles.thumbnail}
          />
        )}
      </View>

      <View style={styles.copy}>
        <View style={styles.topLine}>
          <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
            {exercise.category}
          </ThemedText>
          <ThemedText type="code" themeColor="textSecondary">
            {difficultyLabel}
          </ThemedText>
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          {exercise.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{exercise.description}</ThemedText>

        <View style={styles.metadata}>
          {[exercise.targetBodyArea, equipmentLabel].map((item) => (
            <ThemedView
              key={item}
              type="background"
              style={[styles.metadataItem, { borderColor: theme.border }]}>
              <ThemedText type="small">{item}</ThemedText>
            </ThemedView>
          ))}
        </View>

        <ThemedText type="smallBold" themeColor="accent">
          View guide
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 440,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  thumbnailFrame: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  fallbackMark: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  copy: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  eyebrow: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metadataItem: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
});
