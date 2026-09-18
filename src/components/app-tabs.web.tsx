import { router, usePathname } from 'expo-router';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { useRef } from 'react';
import {
  MdForum,
  MdHelp,
  MdHelpOutline,
  MdHome,
  MdLeaderboard,
  MdOpenInNew,
  MdOutlineForum,
  MdOutlineHome,
  MdOutlineLeaderboard,
  MdOutlinePerson,
  MdPerson,
} from 'react-icons/md';
import {
  Pressable,
  useColorScheme,
  useWindowDimensions,
  View,
  StyleSheet,
  PanResponder,
} from 'react-native';

import { ExternalLink } from './external-link';
import { Icon, type IconType } from './icon';
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

// Outline icon while inactive, filled once the tab is focused.
const tabIcons = {
  home: { outline: MdOutlineHome, filled: MdHome },
  'lost-found': { outline: MdOutlineForum, filled: MdForum },
  leaderboard: { outline: MdOutlineLeaderboard, filled: MdLeaderboard },
  'tech-support': { outline: MdHelpOutline, filled: MdHelp },
  person: { outline: MdOutlinePerson, filled: MdPerson },
} satisfies Record<string, { outline: IconType; filled: IconType }>;

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

type TabButtonProps = TabTriggerSlotProps & { icon: keyof typeof tabIcons };

export function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.tabButtonPressable, pressed && styles.pressed]}>
      <View
        style={[
          styles.tabButtonView,
          styles.tabButtonRow,
          { backgroundColor: isFocused ? theme.accentTrack : 'transparent' },
        ]}>
        <Icon
          icon={isFocused ? tabIcons[icon].filled : tabIcons[icon].outline}
          size={20}
          color={isFocused ? theme.accent : theme.textSecondary}
        />
        <ThemedText
          type="small"
          numberOfLines={1}
          style={styles.tabButtonLabel}
          themeColor={isFocused ? 'accent' : 'textSecondary'}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

// Below this width the brand wordmark and "Docs" link give up their space to the tabs,
// which is what was getting clipped ("Lost & Found" being the longest label).
const COMPACT_WIDTH_BREAKPOINT = 640;

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_WIDTH_BREAKPOINT;

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {!isCompact && (
          <ThemedText type="smallBold" style={styles.brandText}>
            Yaundry
          </ThemedText>
        )}

        {props.children}

        {!isCompact && (
          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={styles.externalPressable}>
              <ThemedText type="link">Docs</ThemedText>
              <Icon icon={MdOpenInNew} size={12} color={colors.text} />
            </Pressable>
          </ExternalLink>
        )}
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
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.one,
    maxWidth: MaxContentWidth,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  brandText: {
    marginRight: 'auto',
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonPressable: {
    flexShrink: 1,
    minWidth: 0,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.three,
  },
  tabButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    flexShrink: 1,
    minWidth: 0,
  },
  tabButtonLabel: {
    flexShrink: 1,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
    flexShrink: 0,
  },
});
