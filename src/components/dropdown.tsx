import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Layout = { x: number; y: number; width: number; height: number };

type DropdownProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

/** A field that opens a menu of options anchored right below it, like a native select. */
export function Dropdown({ value, options, onChange }: DropdownProps) {
  const theme = useTheme();
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);

  function handleOpen() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  }

  return (
    <View>
      <Pressable
        ref={triggerRef}
        onPress={handleOpen}
        style={[styles.trigger, { borderColor: theme.cardBorder }]}>
        <ThemedText style={styles.triggerValue}>{value}</ThemedText>
        <ThemedText themeColor="textMuted" style={styles.chevron}>
          ▾
        </ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        {layout && (
          <ThemedView
            style={[
              styles.menu,
              {
                top: layout.y + layout.height + 6,
                left: layout.x,
                width: layout.width,
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}>
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      selected && { backgroundColor: theme.backgroundSelected },
                    ]}>
                    <ThemedText style={styles.optionLabel}>{option}</ThemedText>
                    {selected && <ThemedText style={styles.optionCheck}>✓</ThemedText>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </ThemedView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  triggerValue: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 14,
  },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: Spacing.two,
    maxHeight: 240,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  menuScroll: {
    maxHeight: 240,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 14,
  },
  optionCheck: {
    fontSize: 14,
    fontWeight: '600',
  },
});
