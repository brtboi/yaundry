import { useMemo, useRef, useState } from 'react';
import { MdStar } from 'react-icons/md';
import { PanResponder, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTheme } from '@/hooks/use-theme';

export const RATING_STAR_FILL = '#FFCB45';
const STAR_COUNT = 5;
const STEP = 0.5;
/** Interactive stars are larger than the 17×16 Figma glyph so a thumb can swipe them. */
export const RATING_STAR_SIZE = 32;
const STAR_GAP = 12;

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
};

function clampRating(raw: number) {
  const stepped = Math.round(raw / STEP) * STEP;
  return Math.min(STAR_COUNT, Math.max(0, stepped));
}

function ratingFromX(x: number, width: number) {
  if (width <= 0) return 0;
  return clampRating((x / width) * STAR_COUNT);
}

export function StarRating({ value, onChange, size = RATING_STAR_SIZE }: StarRatingProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const originXRef = useRef(0);
  const rowRef = useRef<View>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function updateRating(pageX: number) {
    onChangeRef.current(ratingFromX(pageX - originXRef.current, widthRef.current));
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          rowRef.current?.measureInWindow((x) => {
            originXRef.current = x;
            updateRating(evt.nativeEvent.pageX);
          });
        },
        onPanResponderMove: (evt) => {
          updateRating(evt.nativeEvent.pageX);
        },
      }),
    [],
  );

  return (
    <View
      ref={rowRef}
      accessibilityRole="adjustable"
      accessibilityLabel="Machine rating"
      accessibilityValue={{ min: 0, max: STAR_COUNT, now: value }}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        widthRef.current = nextWidth;
        if (nextWidth !== width) setWidth(nextWidth);
        rowRef.current?.measureInWindow((x) => {
          originXRef.current = x;
        });
      }}
      {...panResponder.panHandlers}
      style={styles.row}>
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starValue = index + 1;
        const fill = value >= starValue ? 1 : value >= starValue - 0.5 ? 0.5 : 0;
        return <RatingStar key={starValue} fill={fill} size={size} />;
      })}
    </View>
  );
}

function RatingStar({ fill, size }: { fill: 0 | 0.5 | 1; size: number }) {
  const theme = useTheme();
  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
      <Icon icon={MdStar} size={size} color={theme.backgroundSelected} />
      {fill > 0 && (
        <View
          style={[
            styles.fillClip,
            { width: fill === 0.5 ? size / 2 : size, height: size },
          ]}>
          <Icon icon={MdStar} size={size} color={RATING_STAR_FILL} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: STAR_GAP,
    paddingVertical: 12,
  },
  fillClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
});
