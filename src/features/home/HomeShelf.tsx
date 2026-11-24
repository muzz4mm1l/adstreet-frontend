import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SurfaceColors } from '@/constants/theme';

export interface ShelfItem {
  id: string;
  title: string;
  /** Card artwork (require(...) or { uri }). Placeholder is shown until provided. */
  image?: any;
}

interface HomeShelfProps {
  title: string;
  items: ShelfItem[];
  onPressItem?: (item: ShelfItem) => void;
}

const CARD_WIDTH = 150;
const IMAGE_ASPECT = 1.72;

/** Titled horizontal shelf of image cards with a caption underneath (fresh leaks, listings…). */
export const HomeShelf: React.FC<HomeShelfProps> = ({ title, items, onPressItem }) => (
  <View style={styles.section}>
    <Text style={styles.heading} accessibilityRole="header">
      {title}
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + 14}
      contentContainerStyle={styles.row}>
      {items.map((item, i) => (
        <Animated.View key={item.id} entering={FadeInDown.duration(350).delay(i * 50)}>
          <HapticPressable
            haptic="light"
            scaleTo={0.97}
            borderRadius={10}
            onPress={() => onPressItem?.(item)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            style={styles.card}>
            <View style={styles.imageFrame}>
              {item.image ? (
                <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="image-outline" size={22} color="#B6BAC3" />
                </View>
              )}
            </View>
            <Text style={styles.caption} numberOfLines={2}>
              {item.title}
            </Text>
          </HapticPressable>
        </Animated.View>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginHorizontal: -20, // bleed to the screen edge so cards scroll off-screen
  },
  heading: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '600',
    color: SurfaceColors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  row: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: CARD_WIDTH,
  },
  imageFrame: {
    width: CARD_WIDTH,
    aspectRatio: IMAGE_ASPECT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ECEEF2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.35)',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    marginTop: 10,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: SurfaceColors.textPrimary,
  },
});
