import React from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const isTestEnvironment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

type Props = {
  screenKey: string;
  children: React.ReactNode;
};

export function ScreenTransition({ screenKey, children }: Props) {
  const opacity = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isTestEnvironment) return;

    opacity.setValue(0.9);
    translateY.setValue(8);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, screenKey, translateY]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
