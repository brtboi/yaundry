import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type PingReceivedData = {
  senderName: string;
  location: string;
};

type PingReceivedNotificationProps = {
  data: PingReceivedData | null;
  onDismiss: () => void;
  onReply: (message: string) => void;
};

const quickReplies = [
  { id: 'omw', label: 'myb, omw!' },
  { id: 'basket', label: 'just dump it in my laundry basket' },
];

const HIDDEN_Y = -220;

/**
 * Mirrors the "Lock Screen - Ping Notification" card from the DFA Figma: someone pinged you
 * because your laundry is still sitting in a machine they want to use.
 */
export function PingReceivedNotification({
  data,
  onDismiss,
  onReply,
}: PingReceivedNotificationProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (!data) return;
    setCustomOpen(false);
    setCustomText('');
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function hide() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: HIDDEN_Y, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }

  function send(message: string) {
    onReply(message);
    hide();
  }

  if (!data) return null;

  const cardBg = isDark ? 'rgba(28,28,30,0.94)' : 'rgba(255,255,255,0.94)';
  const actionColor = isDark ? '#0A84FF' : '#007AFF';
  const dividerColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const mutedColor = isDark ? '#9A9A9E' : '#737378';

  return (
    <SafeAreaView style={styles.wrap} edges={['top']} pointerEvents="box-none">
      <Animated.View style={[styles.cardWrap, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.appRow}>
            <View style={styles.appLeft}>
              <View style={[styles.appIcon, { backgroundColor: theme.inUseBorder }]} />
              <ThemedText style={[styles.appName, { color: mutedColor }]}>Yaundry</ThemedText>
            </View>
            <Pressable onPress={hide} hitSlop={8}>
              <ThemedText style={[styles.time, { color: mutedColor }]}>now</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.sender}>{data.senderName}</ThemedText>
          <ThemedText style={styles.message}>
            pinged you to pick up your laundry — {data.location}
          </ThemedText>

          {!customOpen ? (
            <>
              {quickReplies.map((reply) => (
                <Pressable
                  key={reply.id}
                  onPress={() => send(reply.label)}
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
                  <ThemedText style={[styles.actionLabel, { color: actionColor }]}>
                    {reply.label}
                  </ThemedText>
                </Pressable>
              ))}
              <Pressable
                onPress={() => setCustomOpen(true)}
                style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
                <ThemedText style={[styles.actionLabel, { color: actionColor }]}>
                  Custom
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <View style={styles.customRow}>
              <TextInput
                value={customText}
                onChangeText={setCustomText}
                placeholder="Type a reply…"
                placeholderTextColor={mutedColor}
                autoFocus
                returnKeyType="send"
                onSubmitEditing={() => customText.trim() && send(customText.trim())}
                style={[styles.customInput, { color: theme.text, borderColor: dividerColor }]}
              />
              <Pressable
                onPress={() => customText.trim() && send(customText.trim())}
                disabled={!customText.trim()}
                style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
                <ThemedText
                  style={[
                    styles.actionLabel,
                    { color: customText.trim() ? actionColor : mutedColor },
                  ]}>
                  Send
                </ThemedText>
              </Pressable>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    zIndex: 50,
  },
  cardWrap: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginTop: Spacing.two,
  },
  card: {
    borderRadius: 22,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  appName: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.44,
  },
  time: {
    fontSize: 13,
    fontWeight: '400',
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 15,
    lineHeight: 19.5,
    fontWeight: '400',
  },
  actionRow: {
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowPressed: {
    opacity: 0.6,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  customRow: {
    gap: 8,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
