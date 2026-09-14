import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBottomSheetAnimation } from '@/hooks/use-bottom-sheet-animation';
import { useTheme } from '@/hooks/use-theme';

export type TimeValue = { hour: number; minute: number; period: 'AM' | 'PM' };

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = [0, 15, 30, 45];
const periods: TimeValue['period'][] = ['AM', 'PM'];

export function formatTime(value: TimeValue) {
  return `${value.hour}:${value.minute.toString().padStart(2, '0')} ${value.period}`;
}

type TimePickerModalProps = {
  visible: boolean;
  value: TimeValue;
  onClose: () => void;
  onChange: (value: TimeValue) => void;
};

export function TimePickerModal({ visible, value, onClose, onChange }: TimePickerModalProps) {
  const theme = useTheme();
  const { mounted, backdropOpacity, translateY, panHandlers, hide } = useBottomSheetAnimation(
    visible,
    onClose,
  );

  function update(patch: Partial<TimeValue>) {
    onChange({ ...value, ...patch });
  }

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={hide}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={styles.handleRow} {...panHandlers}>
              <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
            </View>

            <ThemedText style={styles.title}>Preferred Laundry Time</ThemedText>

            <ThemedText type="small" themeColor="textMuted" style={styles.columnLabel}>
              HOUR
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {hours.map((hour) => (
                <Chip key={hour} label={String(hour)} selected={value.hour === hour} onPress={() => update({ hour })} />
              ))}
            </ScrollView>

            <ThemedText type="small" themeColor="textMuted" style={styles.columnLabel}>
              MINUTE
            </ThemedText>
            <View style={styles.chipRow}>
              {minutes.map((minute) => (
                <Chip
                  key={minute}
                  label={minute.toString().padStart(2, '0')}
                  selected={value.minute === minute}
                  onPress={() => update({ minute })}
                />
              ))}
            </View>

            <ThemedText type="small" themeColor="textMuted" style={styles.columnLabel}>
              AM / PM
            </ThemedText>
            <View style={styles.chipRow}>
              {periods.map((period) => (
                <Chip
                  key={period}
                  label={period}
                  selected={value.period === period}
                  onPress={() => update({ period })}
                />
              ))}
            </View>

            <Pressable
              onPress={hide}
              style={({ pressed }) => [
                styles.doneButton,
                { backgroundColor: theme.text, opacity: pressed ? 0.85 : 1 },
              ]}>
              <ThemedText style={[styles.doneLabel, { color: theme.background }]}>Done</ThemedText>
            </Pressable>
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: selected ? theme.text : theme.cardBorder,
          backgroundColor: selected ? theme.text : 'transparent',
        },
      ]}>
      <ThemedText type="small" style={{ color: selected ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
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
    marginBottom: Spacing.one,
  },
  columnLabel: {
    letterSpacing: 0.48,
    fontSize: 11,
    marginTop: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 44,
    alignItems: 'center',
  },
  doneButton: {
    borderRadius: Spacing.three,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  doneLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
