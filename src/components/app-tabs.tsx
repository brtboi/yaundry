import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Icon, type FillableIconName } from '@/components/icon';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  // Material Symbols: outline icon by default, filled icon once the tab is selected.
  function tabIcon(name: FillableIconName) {
    return (
      <NativeTabs.Trigger.Icon
        src={{
          default: <Icon name={name} size={24} color={colors.textSecondary} />,
          selected: <Icon name={name} filled size={24} color={colors.accent} />,
        }}
      />
    );
  }

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        {tabIcon('home')}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lost-and-found">
        <NativeTabs.Trigger.Label>Lost & Found</NativeTabs.Trigger.Label>
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
