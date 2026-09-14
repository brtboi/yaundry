import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Icon, type FillableIconName } from '@/components/icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' || scheme == null ? 'light' : scheme;
  const colors = Colors[theme];

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
        <NativeTabs.Trigger.Label>Lost+Found</NativeTabs.Trigger.Label>
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
