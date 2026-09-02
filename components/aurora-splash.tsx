import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AuroraSplashProps {
  onFinish: () => void;
}

export default function AuroraSplash({ onFinish }: AuroraSplashProps) {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const auroraTranslateX = useRef(new Animated.Value(-width)).current;
  const auroraTranslateX2 = useRef(new Animated.Value(width)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const auroraLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(auroraTranslateX, {
            toValue: width,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(auroraTranslateX2, {
            toValue: -width,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(auroraTranslateX, {
            toValue: -width,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(auroraTranslateX2, {
            toValue: width,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    auroraLoop.start();
    shimmerLoop.start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => onFinish());
    }, 3000);

    return () => {
      clearTimeout(timer);
      auroraLoop.stop();
      shimmerLoop.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.auroraContainer}>
        <Animated.View
          style={[
            styles.auroraBand,
            styles.auroraBand1,
            { transform: [{ translateX: auroraTranslateX }] },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(75, 0, 130, 0.4)', 'rgba(0, 200, 150, 0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBand}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.auroraBand,
            styles.auroraBand2,
            { transform: [{ translateX: auroraTranslateX2 }] },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0, 255, 200, 0.3)', 'rgba(138, 43, 226, 0.4)', 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientBand}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.auroraBand,
            styles.auroraBand3,
            { transform: [{ translateX: auroraTranslateX }] },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(212, 175, 55, 0.25)', 'rgba(75, 0, 130, 0.3)', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBand}
          />
        </Animated.View>
      </View>

      <View style={styles.starsContainer}>
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <Animated.View style={[styles.shimmerRing, { opacity: shimmer }]} />
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  auroraContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  auroraBand: {
    position: 'absolute',
    width: width * 2,
    height: height * 0.4,
  },
  auroraBand1: {
    top: '10%',
  },
  auroraBand2: {
    top: '35%',
  },
  auroraBand3: {
    top: '55%',
  },
  gradientBand: {
    flex: 1,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  logoContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  shimmerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
