import type { PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type SectionScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function SectionScreen({ eyebrow, title, description, children }: SectionScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop:
              Platform.OS === 'web' ? Spacing.six + Spacing.four : safeAreaInsets.top + Spacing.five,
            paddingRight: safeAreaInsets.right + Spacing.four,
            paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.five,
            paddingLeft: safeAreaInsets.left + Spacing.four,
          },
        ]}>
        <View style={styles.content}>
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
