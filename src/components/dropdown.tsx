import { useEffect, useRef, useState } from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
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
  const openProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(openProgress, {
      toValue: open ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [open, openProgress]);

  const chevronRotation = openProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor: open ? theme.text : theme.cardBorder,
            backgroundColor: pressed ? theme.backgroundElement : 'transparent',
          },
        ]}>
        <ThemedText style={styles.triggerValue}>{value}</ThemedText>
        <Animated.View
          style={[
            styles.chevronBadge,
            {
              backgroundColor: open ? theme.text : theme.backgroundElement,
              transform: [{ rotate: chevronRotation }],
            },
          ]}>
          <Icon
            icon={MdKeyboardArrowDown}
            size={18}
            color={open ? theme.background : theme.textSecondary}
          />
        </Animated.View>
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
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 10,
  },
  triggerValue: {
    fontSize: 15,
  },
  chevronBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
