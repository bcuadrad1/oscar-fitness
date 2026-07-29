import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type SectionScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  hasNavigationHeader?: boolean;
}>;

export function SectionScreen({
  eyebrow,
  title,
  description,
  hasNavigationHeader = false,
  children,
}: SectionScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const horizontalPadding =
    Platform.OS === 'ios'
      ? { paddingRight: Spacing.four, paddingLeft: Spacing.four }
      : {
          paddingRight: safeAreaInsets.right + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.four,
        };
  const contentPadding = Platform.select({
    web: {
      paddingTop: Spacing.six + Spacing.four,
      paddingBottom: Spacing.five,
    },
    android: {
      paddingTop: (hasNavigationHeader ? 0 : safeAreaInsets.top) + Spacing.five,
      paddingBottom: Spacing.five,
    },
    default: {
      paddingTop: Spacing.five,
      paddingBottom: safeAreaInsets.bottom + Spacing.five,
    },
  });

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentPadding]}>
        <View style={[styles.content, horizontalPadding]}>
          <View style={styles.header}>
            <View style={styles.eyebrowRow}>
              <ThemedView type="accent" style={styles.eyebrowRule} />
              <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
                {eyebrow}
              </ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.description}>
              {description}
            </ThemedText>
          </View>

          <View style={styles.body}>{children}</View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.five,
  },
  header: {
    maxWidth: 680,
    gap: Spacing.three,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  eyebrowRule: {
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  eyebrow: {
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    letterSpacing: -1.8,
  },
  description: {
    maxWidth: 620,
    fontSize: 18,
    lineHeight: 27,
  },
  body: {
    gap: Spacing.three,
  },
});
