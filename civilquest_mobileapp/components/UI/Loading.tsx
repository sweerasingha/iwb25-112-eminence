import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { COLORS, FONTS, SPACING, LAYOUT } from "../../theme";

interface LoadingProps {
  visible?: boolean;
  message?: string;
  variant?: "default" | "overlay" | "inline" | "skeleton";
  size?: "small" | "medium" | "large";
  color?: string;
  fullScreen?: boolean;
}

const { width, height } = Dimensions.get("window");

export const Loading: React.FC<LoadingProps> = ({
  visible = true,
  message = "Loading...",
  variant = "default",
  size = "medium",
  color = COLORS.primary,
  fullScreen = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for custom spinner
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 40;
      default:
        return 30;
    }
  };

  const renderSpinner = () => {
    if (variant === "skeleton") {
      return <SkeletonLoader />;
    }

    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <View style={styles.spinnerContainer}>
        <Animated.View
          style={[
            styles.customSpinner,
            {
              width: getSpinnerSize() + 10,
              height: getSpinnerSize() + 10,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={[color, COLORS.primaryLight, "transparent"]}
            style={styles.spinnerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </View>
    );
  };

  const renderContent = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {renderSpinner()}
      {message && <Text style={[styles.message, { color }]}>{message}</Text>}
    </Animated.View>
  );

  if (!visible) return null;

  if (variant === "inline") {
    const activitySize = size === "medium" ? "large" : size;
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size={activitySize} color={color} />
        {message && (
          <Text style={[styles.inlineMessage, { color }]}>{message}</Text>
        )}
      </View>
    );
  }

  if (variant === "overlay" || fullScreen) {
    return (
      <View style={[styles.overlay, fullScreen && styles.fullScreen]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        <View style={styles.overlayContent}>{renderContent()}</View>
      </View>
    );
  }

  return <View style={styles.container}>{renderContent()}</View>;
};

// Skeleton Loader Component
const SkeletonLoader: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View
        style={[styles.skeletonLine, styles.skeletonTitle, { opacity }]}
      />
      <Animated.View
        style={[styles.skeletonLine, styles.skeletonSubtitle, { opacity }]}
      />
      <Animated.View
        style={[styles.skeletonLine, styles.skeletonText, { opacity }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.overlay,
    zIndex: LAYOUT.zIndex.overlay,
  },
  fullScreen: {
    width,
    height,
  },
  overlayContent: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.borderRadius.xl,
    padding: SPACING.huge,
    minWidth: 200,
    alignItems: "center",
    ...LAYOUT.shadows.lg,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerContainer: {
    marginBottom: SPACING.lg,
  },
  customSpinner: {
    borderRadius: 50,
    padding: 2,
  },
  spinnerGradient: {
    flex: 1,
    borderRadius: 50,
  },
  message: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.medium,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  inlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
  },
  inlineMessage: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.md,
  },

  // Skeleton styles
  skeletonContainer: {
    width: "100%",
    padding: SPACING.lg,
  },
  skeletonLine: {
    backgroundColor: COLORS.borderLight,
    borderRadius: LAYOUT.borderRadius.sm,
    marginBottom: SPACING.md,
  },
  skeletonTitle: {
    height: 24,
    width: "70%",
  },
  skeletonSubtitle: {
    height: 18,
    width: "50%",
  },
  skeletonText: {
    height: 14,
    width: "90%",
  },
});

export default Loading;
