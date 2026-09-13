import { useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.2;
const THROW_DISTANCE = 800;

/**
 * Drag-to-dismiss for a bottom sheet. Spread `panHandlers` onto the sheet's drag handle
 * and apply `translateY` as a transform on the sheet itself.
 */
export function useSwipeToDismiss(onDismiss: () => void) {
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          Animated.timing(translateY, {
            toValue: THROW_DISTANCE,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onDismiss();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    }),
  ).current;

  return { translateY, panHandlers: panResponder.panHandlers };
}
