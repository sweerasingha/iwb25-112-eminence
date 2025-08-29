import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade + scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ImageBackground
      source={require("../../assets/image.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Gradient overlay for readability */}
    

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.logoIcon}>🏛️</Text>
          <Text style={styles.logoText}>Civil Quest</Text>
          <Text style={styles.tagline}>
            Connecting communities, solving together
          </Text>
        </Animated.View>

        {/* Custom Loader */}
        <Animated.View style={{ transform: [{ rotate }] }}>
          <View style={styles.loaderCircle} />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logoIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 14,
    color: "#e0e7ff",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  loaderCircle: {
    width: 40,
    height: 40,
    borderWidth: 4,
    borderColor: "#fff",
    borderTopColor: "transparent",
    borderRadius: 20,
  },
});
