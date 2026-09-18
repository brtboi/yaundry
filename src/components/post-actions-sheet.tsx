import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBottomSheetAnimation } from '@/hooks/use-bottom-sheet-animation';
import { useTheme } from '@/hooks/use-theme';

export type PostAction = 'flag-sensitive' | 'report' | 'hide';

type PostActionsSheetProps = {
  visible: boolean;
  isSensitive: boolean;
  onClose: () => void;
  onAction: (action: PostAction) => void;
};

export function PostActionsSheet({
  visible,
  isSensitive,
  onClose,
  onAction,
}: PostActionsSheetProps) {
  const theme = useTheme();
  const { mounted, backdropOpacity, translateY, panHandlers, hide } = useBottomSheetAnimation(
    visible,
    onClose,
  );

  const actions: { id: PostAction; label: string; destructive?: boolean }[] = [
    {
      id: 'flag-sensitive',
      label: isSensitive ? 'Remove delicates / intimates flag' : 'Flag as delicates / intimates',
    },
    { id: 'hide', label: 'Hide this post' },
    { id: 'report', label: 'Report inappropriate content', destructive: true },
  ];

  function handleAction(action: PostAction) {
    onAction(action);
    hide();
  }

  if (!mounted) return null;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={hide}>
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={hide} />
        </Animated.View>

        <Animated.View style={[styles.sheetWrap, { transform: [{ translateY }] }]}>
          <ThemedView style={[styles.sheet, { backgroundColor: theme.card }]}>
            <View style={styles.handleRow} {...panHandlers}>
              <View style={[styles.handle, { backgroundColor: theme.cardBorder }]} />
            </View>

            {actions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => handleAction(action.id)}
                style={({ pressed }) => [
                  styles.actionRow,
                  { borderColor: theme.cardBorder, opacity: pressed ? 0.7 : 1 },
                ]}>
                <ThemedText
                  style={[styles.actionLabel, action.destructive && styles.destructiveLabel]}>
                  {action.label}
                </ThemedText>
              </Pressable>
            ))}

            <Pressable style={styles.cancelRow} onPress={hide}>
              <ThemedText type="small" themeColor="textMuted">
                Cancel
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    paddingBottom: Spacing.two,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  actionRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  destructiveLabel: {
    color: '#D42E2E',
  },
  cancelRow: {
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
});
