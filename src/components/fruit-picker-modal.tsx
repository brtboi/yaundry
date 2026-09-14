import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { useTheme } from '@/hooks/use-theme';

export type FruitOption = { emoji: string; name: string };

export const fruitOptions: FruitOption[] = [
  { emoji: '🍍', name: 'Pineapple' },
  { emoji: '🍓', name: 'Strawberry' },
  { emoji: '🫐', name: 'Blueberry' },
  { emoji: '🍊', name: 'Tangerine' },
  { emoji: '🍇', name: 'Grape' },
  { emoji: '🥝', name: 'Kiwi' },
  { emoji: '🍑', name: 'Peach' },
  { emoji: '🍒', name: 'Cherry' },
  { emoji: '🍋', name: 'Lemon' },
  { emoji: '🍉', name: 'Watermelon' },
  { emoji: '🥭', name: 'Mango' },
  { emoji: '🍏', name: 'Green Apple' },
];

type FruitPickerModalProps = {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (fruit: FruitOption) => void;
};

export function FruitPickerModal({ visible, selected, onClose, onSelect }: FruitPickerModalProps) {
  const theme = useTheme();
  const { translateY, panHandlers } = useSwipeToDismiss(onClose);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={{ transform: [{ translateY }] }}>
          <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={styles.handleRow} {...panHandlers}>
              <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
            </View>

            <ThemedText style={styles.title}>Choose your fruit</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              Shown instead of your real name when you ping others or post to Lost & Found.
            </ThemedText>

            <View style={styles.grid}>
              {fruitOptions.map((fruit) => {
                const isSelected = fruit.name === selected;
                return (
                  <Pressable
                    key={fruit.name}
                    onPress={() => onSelect(fruit)}
                    style={[
                      styles.fruitCell,
                      {
                        borderColor: isSelected ? theme.text : theme.cardBorder,
                        borderWidth: isSelected ? 1.5 : 1,
                        backgroundColor: isSelected ? theme.backgroundSelected : 'transparent',
                      },
                    ]}>
                    <ThemedText style={styles.fruitEmoji}>{fruit.emoji}</ThemedText>
                    <ThemedText type="small" style={styles.fruitName}>
                      {fruit.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  handleRow: {
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  fruitCell: {
    width: '30%',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    gap: 4,
  },
  fruitEmoji: {
    fontSize: 28,
  },
  fruitName: {
    fontSize: 12,
    textAlign: 'center',
  },
});
