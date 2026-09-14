import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import type { ComponentProps } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// NativeTabs.Trigger.Icon only supports NativeTabs.Trigger.VectorIcon as a React-element
// icon source (our custom SvgXml-based Icon component isn't supported there and silently
// fails to render) — so the native tab bar uses this MaterialCommunityIcons mapping
// instead of the Material Symbols SVGs used on web.
type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabIconNames: Record<
  'home' | 'lost-found' | 'leaderboard' | 'tech-support' | 'person',
  { outline: MaterialCommunityIconName; filled: MaterialCommunityIconName }
> = {
  home: { outline: 'home-outline', filled: 'home' },
  'lost-found': { outline: 'forum-outline', filled: 'forum' },
  leaderboard: { outline: 'trophy-outline', filled: 'trophy' },
  'tech-support': { outline: 'help-circle-outline', filled: 'help-circle' },
  person: { outline: 'account-outline', filled: 'account' },
};

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' || scheme == null ? 'light' : scheme;
  const colors = Colors[theme];

  // Outline icon by default, filled icon once the tab is selected.
  function tabIcon(name: keyof typeof tabIconNames) {
    const { outline, filled } = tabIconNames[name];
    return (
      <NativeTabs.Trigger.Icon
        src={{
          default: <NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name={outline} />,
          selected: <NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name={filled} />,
        }}
      />
    );
  }

  return (
    <NativeTabs
      // NativeTabs is a native-backed (unstable) component that doesn't reliably re-apply
      // appearance props after its first mount — remount it whenever the effective scheme
      // changes so the OS tab bar actually picks up the new colors.
      key={theme}
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={{ default: colors.textSecondary, selected: colors.accent }}
      labelStyle={{
        default: { fontSize: 10 },
        selected: { fontSize: 10, color: colors.text },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        {tabIcon('home')}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lost-and-found">
        <NativeTabs.Trigger.Label>Lost&Found</NativeTabs.Trigger.Label>
        {tabIcon('lost-found')}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="leaderboard">
        <NativeTabs.Trigger.Label>Leaderboard</NativeTabs.Trigger.Label>
        {tabIcon('leaderboard')}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tech-support">
        <NativeTabs.Trigger.Label>Support</NativeTabs.Trigger.Label>
        {tabIcon('tech-support')}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        {tabIcon('person')}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
