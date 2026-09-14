import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

type AnimatedSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor: string;
  inactiveColor: string;
  thumbColor?: string;
};

const WIDTH = 44;
const HEIGHT = 26;
const THUMB_SIZE = 22;
const PADDING = 2;

export function AnimatedSwitch({
  value,
  onValueChange,
  activeColor,
  inactiveColor,
  thumbColor = '#ffffff',
}: AnimatedSwitchProps) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      bounciness: 8,
    }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [PADDING, WIDTH - THUMB_SIZE - PADDING],
  });

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View
          style={[styles.thumb, { backgroundColor: thumbColor, transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
