import { SvgXml } from 'react-native-svg';

import {
  commentsSvg,
  editSvg,
  googleLogoSvg,
  heartFilledSvg,
  heartOutlineSvg,
  homeSvg,
  leaderboardSvg,
  lostFoundSvg,
  mapPinSvg,
  moreSvg,
  personSvg,
  searchSvg,
  starSvg,
  techSupportSvg,
} from '@/components/icon-svgs';

const icons = {
  home: homeSvg,
  'lost-found': lostFoundSvg,
  leaderboard: leaderboardSvg,
  'tech-support': techSupportSvg,
  person: personSvg,
  google: googleLogoSvg,
  search: searchSvg,
  edit: editSvg,
  star: starSvg,
  'map-pin': mapPinSvg,
  heart: heartOutlineSvg,
  'heart-filled': heartFilledSvg,
  comments: commentsSvg,
  more: moreSvg,
} as const;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = 24, color }: IconProps) {
  return <SvgXml xml={icons[name]} width={size} height={size} color={color} />;
}
