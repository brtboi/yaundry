import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const ENTER_DURATION = 260;
const EXIT_DURATION = 200;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.2;

/**
 * Drives a bottom sheet's backdrop fade and sheet slide-in/out independently (so the backdrop
 * doesn't physically slide up with the sheet, which is what React Native's own Modal
 * `animationType="slide"` does when a backdrop and sheet share one animated root), plus
 * drag-to-dismiss on the sheet's handle.
 *
 * Use with `<Modal transparent animationType="none" visible={mounted} .../>` — the hook manages
 * its own mount/unmount timing so the exit animation can finish before the Modal disappears.
 */
export function useBottomSheetAnimation(visible: boolean, onDismiss: () => void) {
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: ENTER_DURATION,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 14,
          }),
        ]).start();
      });
    } else if (mounted) {
      playExit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function playExit() {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: EXIT_DURATION, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }

  /** Play the exit animation, then notify the parent to actually close. */
  function hide() {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: EXIT_DURATION, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: EXIT_DURATION, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
        onDismissRef.current();
      }
    });
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          hide();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
    }),
  ).current;

  return {
    mounted,
    backdropOpacity,
    translateY,
    panHandlers: panResponder.panHandlers,
    /** Call instead of the raw onClose/onDismiss prop so the exit animation plays first. */
    hide,
  };
}
