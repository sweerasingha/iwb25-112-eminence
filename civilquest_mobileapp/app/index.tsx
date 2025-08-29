import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../hooks";
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, LAYOUT, FONTS } from "../theme";

const { width, height } = Dimensions.get('window');

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for the logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.gradientStart, COLORS.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Container */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoBackground,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <LinearGradient
                colors={[COLORS.white + '40', COLORS.white + '10']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            
            <View style={styles.logoIcon}>
              <Ionicons name="construct" size={48} color={COLORS.white} />
            </View>
          </View>

          {/* App Title */}
          <Text style={styles.appTitle}>Civil Quest</Text>
          <Text style={styles.appSubtitle}>New Era of Community Service</Text>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                  styles.loadingProgress,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Loading your experience...</Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="calendar" size={20} color={COLORS.white + 'CC'} />
              <Text style={styles.featureText}>Discover Events</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="people" size={20} color={COLORS.white + 'CC'} />
              <Text style={styles.featureText}>Join Community</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trophy" size={20} color={COLORS.white + 'CC'} />
              <Text style={styles.featureText}>Earn Rewards</Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Decoration */}
        <View style={styles.bottomDecoration}>
          <View style={styles.decorationCircle} />
          <View style={[styles.decorationCircle, styles.decorationCircle2]} />
          <View style={[styles.decorationCircle, styles.decorationCircle3]} />
        </View>
      </View>
    );
  }

  // Redirect based on authentication status
  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/auth/login" />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.huge,
  },

  // Logo Styles
  logoContainer: {
    position: 'relative',
    marginBottom: SPACING.huge,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'absolute',
  },
  logoGradient: {
    flex: 1,
    borderRadius: 60,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...LAYOUT.shadows.lg,
  },

  // Title Styles
  appTitle: {
    fontSize: FONTS.sizes.giant,
    fontWeight: FONTS.weights.black,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.regular,
    color: COLORS.white ,
    textAlign: 'center',
    marginBottom: SPACING.enormous,
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.enormous,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: COLORS.white + '30',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  loadingProgress: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white + 'CC',
    fontWeight: FONTS.weights.medium,
  },

  // Features Styles
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.xl,
  },
  feature: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },

  // Decoration Styles
  bottomDecoration: {
    position: 'absolute',
    bottom: -50,
    right: -50,
  },
  decorationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white + '10',
    position: 'absolute',
  },
  decorationCircle2: {
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -25,
    right: -25,
    backgroundColor: COLORS.white + '05',
  },
  decorationCircle3: {
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: -50,
    right: -50,
    backgroundColor: COLORS.white + '03',
  },
});
