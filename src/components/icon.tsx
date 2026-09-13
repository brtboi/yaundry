import { SvgXml } from 'react-native-svg';

import {
  commentsSvg,
  editSvg,
  googleLogoSvg,
  heartOutlineSvg,
  homeOutlineSvg,
  homeSvg,
  leaderboardOutlineSvg,
  leaderboardSvg,
  lostFoundOutlineSvg,
  lostFoundSvg,
  mapPinSvg,
  moreSvg,
  personOutlineSvg,
  personSvg,
  searchSvg,
  starSvg,
  techSupportOutlineSvg,
  techSupportSvg,
} from '@/components/icon-svgs';

// Icons with a distinct outline (inactive) and filled (active) Material Symbol variant.
const fillableIcons = {
  home: { outline: homeOutlineSvg, filled: homeSvg },
  'lost-found': { outline: lostFoundOutlineSvg, filled: lostFoundSvg },
  leaderboard: { outline: leaderboardOutlineSvg, filled: leaderboardSvg },
  'tech-support': { outline: techSupportOutlineSvg, filled: techSupportSvg },
  person: { outline: personOutlineSvg, filled: personSvg },
} as const;

const icons = {
  ...Object.fromEntries(
    Object.entries(fillableIcons).map(([name, { outline }]) => [name, outline]),
  ),
  google: googleLogoSvg,
  search: searchSvg,
  edit: editSvg,
  star: starSvg,
  'map-pin': mapPinSvg,
  heart: heartOutlineSvg,
  comments: commentsSvg,
  more: moreSvg,
} as { [K in FillableIconName]: string } & Record<
  'google' | 'search' | 'edit' | 'star' | 'map-pin' | 'heart' | 'comments' | 'more',
  string
>;

export type FillableIconName = keyof typeof fillableIcons;
export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /** Use the filled Material Symbol variant, for icons that have one (see `FillableIconName`). */
  filled?: boolean;
};

export function Icon({ name, size = 24, color, filled }: IconProps) {
  const xml =
    filled && name in fillableIcons
      ? fillableIcons[name as FillableIconName].filled
      : icons[name];
  return <SvgXml xml={xml} width={size} height={size} color={color} />;
}
