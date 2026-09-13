import { router, usePathname } from 'expo-router';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { useRef } from 'react';
import { Pressable, useColorScheme, View, StyleSheet, PanResponder } from 'react-native';

import { ExternalLink } from './external-link';
import { Icon } from './icon';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Order tabs are shown in the bar, and swiped through, left to right.
const tabRoutes = [
  '/home',
  '/home/lost-and-found',
  '/home/leaderboard',
  '/home/tech-support',
  '/home/profile',
] as const;

const SWIPE_DISTANCE_THRESHOLD = 60;

export default function AppTabs() {
  return (
    <Tabs>
      <SwipeableTabSlot />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton icon="home">Home</TabButton>
          </TabTrigger>
          <TabTrigger name="lost-and-found" href="/home/lost-and-found" asChild>
            <TabButton icon="lost-found">Lost & Found</TabButton>
          </TabTrigger>
          <TabTrigger name="leaderboard" href="/home/leaderboard" asChild>
            <TabButton icon="leaderboard">Leaderboard</TabButton>
          </TabTrigger>
          <TabTrigger name="tech-support" href="/home/tech-support" asChild>
            <TabButton icon="tech-support">Support</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/home/profile" asChild>
            <TabButton icon="person">Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

/** Wraps the active tab's screen so a horizontal drag switches to the next/previous tab. */
function SwipeableTabSlot() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (_evt, gesture) => {
        if (Math.abs(gesture.dx) < SWIPE_DISTANCE_THRESHOLD) return;

        const currentIndex = tabRoutes.indexOf(pathnameRef.current as (typeof tabRoutes)[number]);
        if (currentIndex === -1) return;

        const nextIndex = gesture.dx < 0 ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0 || nextIndex >= tabRoutes.length) return;

        router.push(tabRoutes[nextIndex]);
      },
    }),
  ).current;

  return <TabSlot style={{ height: '100%' }} {...panResponder.panHandlers} />;
}

type TabButtonProps = TabTriggerSlotProps & { icon: import('./icon').IconName };

export function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const theme = useTheme();
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.tabButtonView, styles.tabButtonRow]}>
        <Icon name={icon} size={20} color={isFocused ? theme.text : theme.textSecondary} />
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Yaundry
        </ThemedText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
