import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconType } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type NotificationPreview = {
  icon: IconType;
  title: string;
  message: string;
};

type NotificationToastProps = {
  data: NotificationPreview | null;
  onDismiss: () => void;
  durationMs?: number;
};

const HIDDEN_Y = -160;

export function NotificationToast({ data, onDismiss, durationMs = 3800 }: NotificationToastProps) {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(HIDDEN_Y)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!data) return;

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(hide, durationMs);
    return () => clearTimeout(timer);
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

  if (!data) return null;

  return (
    <SafeAreaView style={styles.wrap} edges={['top']} pointerEvents="box-none">
      <Animated.View style={[styles.toastWrap, { opacity, transform: [{ translateY }] }]}>
        <Pressable
          onPress={hide}
          style={[styles.toast, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={[styles.iconBadge, { backgroundColor: theme.backgroundSelected }]}>
            <Icon icon={data.icon} size={18} color={theme.text} />
          </View>
          <View style={styles.copy}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {data.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted" numberOfLines={2}>
              {data.message}
            </ThemedText>
          </View>
        </Pressable>
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
  toastWrap: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginTop: Spacing.two,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
});
