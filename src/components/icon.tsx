import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export type { IconType };

// react-icons renders DOM <svg>/<path> tags, which only exist on web. Instead of mounting the
// react-icons component directly, we call it once to get its element tree and rebuild that
// tree out of react-native-svg primitives, so the same icons render on iOS, Android and web.
const svgElements: Record<string, React.ComponentType<any>> = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  g: G,
  line: Line,
  polygon: Polygon,
  polyline: Polyline,
  rect: Rect,
};

// Root <svg> attributes that only matter to the browser.
const ignoredRootAttrs = new Set(['version', 'x', 'y', 'enableBackground', 'xmlns']);

type SvgNodeProps = Record<string, unknown> & { children?: ReactNode };
type ConvertedIcon = { viewBox: string; rootProps: Record<string, unknown>; children: ReactNode };

const converted = new WeakMap<IconType, ConvertedIcon>();

function toNativeSvg(nodes: ReactNode): ReactNode {
  return Children.map(nodes, (node) => {
    if (!isValidElement<SvgNodeProps>(node) || typeof node.type !== 'string') return null;
    const Component = svgElements[node.type];
    if (!Component) return null;
    const { children, ...props } = node.props;
    return <Component {...props}>{toNativeSvg(children)}</Component>;
  });
}

function convertIcon(icon: IconType): ConvertedIcon {
  const cached = converted.get(icon);
  if (cached) return cached;

  const base = icon({}) as ReactElement<{ attr?: Record<string, string>; children?: ReactNode }>;
  const { viewBox = '0 0 24 24', ...attr } = base.props.attr ?? {};
  const rootProps = Object.fromEntries(
    Object.entries(attr).filter(([key]) => !ignoredRootAttrs.has(key)),
  );
  const result = { viewBox, rootProps, children: toNativeSvg(base.props.children) };
  converted.set(icon, result);
  return result;
}

type IconProps = {
  /** Any react-icons component, e.g. `MdHome` from `react-icons/md`. */
  icon: IconType;
  size?: number;
  color?: string;
};

export function Icon({ icon, size = 24, color }: IconProps) {
  const { viewBox, rootProps, children } = convertIcon(icon);
  return (
    <Svg
      width={size}
      height={size}
      viewBox={viewBox}
      color={color}
      // Same defaults react-icons' IconBase applies to its <svg>.
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={0}
      {...rootProps}>
      {children}
    </Svg>
  );
}
