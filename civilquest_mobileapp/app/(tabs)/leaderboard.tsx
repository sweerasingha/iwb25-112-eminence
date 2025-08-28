import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  Keyboard,
  FlatList,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { LeaderboardCard, LeaderboardFilters, Loading } from "../../components";
import { useLeaderboard } from "../../hooks";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { LeaderboardEntry } from "../../types";

export default function LeaderboardScreen() {
  const {
    leaderboard,
    leaderboardData,
    isLoading,
    error,
    filters,
    availableCities,
    limitOptions,
    loadLeaderboard,
    updateFilters,
    resetFilters,
    refresh,
  } = useLeaderboard();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [
        { text: "Retry", onPress: loadLeaderboard },
        { text: "OK", style: "cancel" },
      ]);
    }
  }, [error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  const renderLeaderboardEntry = ({
    item,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => (
    <View style={styles.cardContainer}>
      <LeaderboardCard entry={item} showCity={filters.city === "All Cities"} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="trophy-outline" size={64} color={COLORS.textTertiary} />
      <Text style={[globalStyles.h3, styles.emptyTitle]}>
        No Leaderboard Data
      </Text>
      <Text style={[globalStyles.body, styles.emptySubtitle]}>
        {filters.city !== "All Cities"
          ? `No rankings found for ${filters.city}. Try adjusting your filters.`
          : "The leaderboard is currently empty. Check back later!"}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
      <Text style={[globalStyles.h3, styles.errorTitle]}>
        Something went wrong
      </Text>
      <Text style={[globalStyles.body, styles.errorSubtitle]}>
        Unable to load the leaderboard. Please check your connection and try
        again.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Ionicons name="trophy" size={32} color={COLORS.white} />
          <View style={styles.heroText}>
            <Text style={[globalStyles.h2, styles.heroTitle]}>Leaderboard</Text>
            <Text style={[globalStyles.body, styles.heroSubtitle]}>
              {leaderboardData?.scope === "global"
                ? "Global Rankings"
                : `${filters.city} Rankings`}
            </Text>
          </View>
        </View>

        {leaderboardData && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{leaderboardData.total}</Text>
              <Text style={styles.statLabel}>Total Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {leaderboardData.results.length}
              </Text>
              <Text style={styles.statLabel}>Showing</Text>
            </View>
            {filters.city !== "All Cities" && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{filters.city}</Text>
                <Text style={styles.statLabel}>City</Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <LeaderboardFilters
          filters={filters}
          availableCities={availableCities}
          limitOptions={limitOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />
      </View>
    </View>
  );

  if (isLoading && !refreshing && leaderboard.length === 0) {
    return (
      <View style={globalStyles.centerContainer}>
        <Loading
          visible={true}
          message="Loading leaderboard..."
          variant="overlay"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardEntry}
        keyExtractor={(item, index) => `${item.email}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Important for scrolling vs keyboard:
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "on-drag" : "none"}
        onScrollBeginDrag={Keyboard.dismiss}
        // Avoid touch/clip issues:
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.surface}
            title="Pull to refresh rankings..."
            titleColor={COLORS.textSecondary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={error ? renderError : renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => <View style={styles.footer} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: SPACING.lg,
  },
  heroSection: {
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.xl,
    ...LAYOUT.shadows.lg,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  heroText: {
    marginLeft: SPACING.lg,
    flex: 1,
  },
  heroTitle: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    color: COLORS.white,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
  },
  listContainer: {
    paddingBottom: SPACING.enormous, 
  },
  cardContainer: {
    paddingHorizontal: SPACING.lg,
  },
  separator: {
    height: SPACING.sm,
  },
  footer: {
    height: SPACING.lg,
  },
  emptyState: {
    alignItems: "center",
    padding: SPACING.huge,
    marginTop: SPACING.enormous,
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.textTertiary,
    textAlign: "center",
    lineHeight: 22,
  },
  errorState: {
    alignItems: "center",
    padding: SPACING.huge,
    marginTop: SPACING.enormous,
  },
  errorTitle: {
    color: COLORS.error,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  errorSubtitle: {
    color: COLORS.textTertiary,
    textAlign: "center",
    lineHeight: 22,
  },
});
