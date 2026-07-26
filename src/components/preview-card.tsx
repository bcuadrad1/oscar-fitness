import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PreviewCardProps = {
  index: number;
  eyebrow: string;
  title: string;
  description: string;
  metadata?: readonly string[];
};

export function PreviewCard({
  index,
  eyebrow,
  title,
  description,
  metadata = [],
}: PreviewCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.topLine}>
        <ThemedText type="code" themeColor="accent">
          {String(index + 1).padStart(2, '0')}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
          {eyebrow}
        </ThemedText>
      </View>

      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{description}</ThemedText>
      </View>

      {metadata.length > 0 && (
        <View style={styles.metadata}>
          {metadata.map((item) => (
            <ThemedView
              key={item}
              type="background"
              style={[styles.metadataItem, { borderColor: theme.border }]}>
              <ThemedText type="small">{item}</ThemedText>
            </ThemedView>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.three,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  eyebrow: {
    flexShrink: 1,
    letterSpacing: 1,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  copy: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
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
