import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ExerciseThumbnail, ExerciseVideo as ExerciseVideoData } from '@/features/exercises/exercise-types';
import { useTheme } from '@/hooks/use-theme';

type ExerciseVideoProps = {
  exerciseName: string;
  thumbnail: ExerciseThumbnail;
  video: ExerciseVideoData | null;
};

export function ExerciseVideo({ exerciseName, thumbnail, video }: ExerciseVideoProps) {
  const [retryKey, setRetryKey] = useState(0);

  if (!video) {
    return (
      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="accent" style={styles.label}>
          Video demonstration
        </ThemedText>
        <MediaState
          thumbnail={thumbnail}
          title="Video unavailable"
          description={`A demonstration is not available for ${exerciseName}. Use the written instructions below.`}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="accent" style={styles.label}>
        {video.label}
      </ThemedText>
      <PlayableExerciseVideo
        key={retryKey}
        thumbnail={thumbnail}
        video={video}
        onRetry={() => setRetryKey((key) => key + 1)}
      />
      <ThemedText type="small" themeColor="textSecondary">
        Network access is required. This development sample may fail while offline.
      </ThemedText>
    </View>
  );
}

type PlayableExerciseVideoProps = {
  thumbnail: ExerciseThumbnail;
  video: ExerciseVideoData;
  onRetry: () => void;
};

function PlayableExerciseVideo({ thumbnail, video, onRetry }: PlayableExerciseVideoProps) {
  const theme = useTheme();
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false);
  const player = useVideoPlayer({ uri: video.uri, contentType: 'progressive' });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const isLoading = (status === 'idle' || status === 'loading') && !hasRenderedFrame;

  if (status === 'error') {
    return (
      <MediaState
        thumbnail={thumbnail}
        title="Playback unavailable"
        description="The development video could not be loaded. Check your connection and try again."
        actionLabel="Retry video"
        onAction={onRetry}
        alert
      />
    );
  }

  return (
    <View style={[styles.frame, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Image
        source={thumbnail.source}
        accessibilityLabel={thumbnail.alt}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
      <VideoView
        accessibilityLabel={video.accessibilityLabel}
        player={player}
        nativeControls
        playsInline
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        onFirstFrameRender={() => setHasRenderedFrame(true)}
        style={styles.video}
      />
      {isLoading && (
        <View
          pointerEvents="none"
          accessibilityRole="progressbar"
          accessibilityLabel="Loading development video"
          accessibilityLiveRegion="polite"
          style={[styles.loadingOverlay, { backgroundColor: theme.backgroundElement }]}>
          <ActivityIndicator color={theme.accent} size="large" />
          <ThemedText type="smallBold">Loading video</ThemedText>
        </View>
      )}
    </View>
  );
}

type MediaStateProps = {
  thumbnail: ExerciseThumbnail;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  alert?: boolean;
};

function MediaState({
  thumbnail,
  title,
  description,
  actionLabel,
  onAction,
  alert = false,
}: MediaStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole={alert ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
      style={[styles.frame, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Image
        source={thumbnail.source}
        accessibilityLabel={thumbnail.alt}
        contentFit="cover"
        style={styles.stateImage}
      />
      <View style={[styles.statePanel, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
        {actionLabel && onAction && (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: theme.backgroundSelected, borderColor: theme.accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">{actionLabel}</ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  label: {
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    opacity: 0.92,
  },
  stateImage: {
    width: '100%',
    height: '100%',
  },
  statePanel: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    left: Spacing.three,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  retryButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.five,
  },
  pressed: {
    opacity: 0.7,
  },
});
