import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Icon, type FillableIconName } from '@/components/icon';
import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  // Material Symbols: outline icon by default, filled icon once the tab is selected.
  // Rendered as template (alpha-mask) icons so the OS tints them live from `iconColor`
  // below — baking a fixed color into the icon itself doesn't react to dark mode changes.
  function tabIcon(name: FillableIconName) {
    return (
      <NativeTabs.Trigger.Icon
        renderingMode="template"
        src={{
          default: <Icon name={name} size={24} color="#000000" />,
          selected: <Icon name={name} filled size={24} color="#000000" />,
        }}
      />
    );
  }

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      iconColor={{ default: colors.textSecondary, selected: colors.accent }}
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
