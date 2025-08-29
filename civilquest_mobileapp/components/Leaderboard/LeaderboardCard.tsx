import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { LeaderboardEntry } from "../../types";
import { globalStyles, COLORS, SPACING, LAYOUT, FONTS } from "../../theme";

export interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  onPress?: () => void;
  style?: ViewStyle;
  showCity?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entry,
  onPress,
  style,
  showCity = true,
}) => {
  const { name, points, rank, globalRank, cityRank, livingCity, email } = entry;

  // Determine rank styling and icon
  const getRankStyling = () => {
    switch (rank) {
      case 1:
        return {
          rankColor: COLORS.warning,
          rankIcon: "trophy" as const,
          gradientColors: [
            COLORS.warning + "20",
            COLORS.warning + "05",
          ] as const,
          borderColor: COLORS.warning,
        };
      case 2:
        return {
          rankColor: COLORS.textSecondary,
          rankIcon: "medal" as const,
          gradientColors: [
            COLORS.textSecondary + "20",
            COLORS.textSecondary + "05",
          ] as const,
          borderColor: COLORS.textSecondary,
        };
      case 3:
        return {
          rankColor: "#CD7F32", // Bronze color
          rankIcon: "medal" as const,
          gradientColors: ["#CD7F3220", "#CD7F3205"] as const,
          borderColor: "#CD7F32",
        };
      default:
        return {
          rankColor: COLORS.textTertiary,
          rankIcon: "person" as const,
          gradientColors: [COLORS.surface, COLORS.surface] as const,
          borderColor: COLORS.borderLight,
        };
    }
  };

  const rankStyling = getRankStyling();

  const Card = onPress ? TouchableOpacity : View;

  return (
    <Card
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <LinearGradient
        colors={rankStyling.gradientColors}
        style={[
          styles.gradientBackground,
          { borderColor: rankStyling.borderColor },
        ]}
      >
        {/* Rank Badge */}
        <View
          style={[styles.rankBadge, { backgroundColor: rankStyling.rankColor }]}
        >
          <Ionicons
            name={rankStyling.rankIcon}
            size={16}
            color={COLORS.white}
          />
          <Text style={styles.rankText}>#{rank}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={[globalStyles.h4, styles.userName]} numberOfLines={1}>
              {name}
            </Text>
            <Text
              style={[globalStyles.caption, styles.userEmail]}
              numberOfLines={1}
            >
              {email}
            </Text>
            {showCity && livingCity && (
              <View style={styles.cityContainer}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={COLORS.textTertiary}
                />
                <Text style={[globalStyles.caption, styles.cityText]}>
                  {livingCity}
                </Text>
              </View>
            )}
          </View>

          {/* Points */}
          <View style={styles.pointsContainer}>
            <Text style={[globalStyles.h3, styles.points]}>
              {points.toLocaleString()}
            </Text>
            <Text style={[globalStyles.caption, styles.pointsLabel]}>
              points
            </Text>
          </View>
        </View>

        {/* Rank Info */}
        <View style={styles.rankInfo}>
          <View style={styles.rankItem}>
            <Text style={[globalStyles.caption, styles.rankLabel]}>Global</Text>
            <Text style={[globalStyles.bodySmall, styles.rankValue]}>
              #{globalRank}
            </Text>
          </View>
          {cityRank && (
            <View style={styles.rankItem}>
              <Text style={[globalStyles.caption, styles.rankLabel]}>City</Text>
              <Text style={[globalStyles.bodySmall, styles.rankValue]}>
                #{cityRank}-{livingCity}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  gradientBackground: {
    borderRadius: LAYOUT.borderRadius.lg,
    borderWidth: 1,
    overflow: "visible",
    ...LAYOUT.shadows.sm,
  },
  rankBadge: {
    position: "absolute",
    top: -8,
    left: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.full,
    zIndex: 5,
    ...LAYOUT.shadows.sm,
  },
  rankText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  userInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  userName: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityText: {
    marginLeft: SPACING.xs,
    color: COLORS.textTertiary,
  },
  pointsContainer: {
    alignItems: "center",
  },
  points: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  pointsLabel: {
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  rankInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  rankItem: {
    alignItems: "center",
  },
  rankLabel: {
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  rankValue: {
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.semibold,
  },
});
