import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useEvents } from "../../hooks/useEvents";
import { useAuth } from "../../hooks";
import { AppliedEventCard, Loading } from "../../components";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { AppliedEvent } from "../../types";

export default function MyEventsScreen() {
  const router = useRouter();
  const {
    appliedEvents,
    loadAppliedEvents,
    isLoadingAppliedEvents,
    appliedEventsError,
  } = useEvents();
  const { userRole, isAuthenticated } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "interested" | "will_join"
  >("all");
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadAppliedEvents();
    }
  }, [loadAppliedEvents, isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppliedEvents();
    setRefreshing(false);
  };

  const getFilteredEvents = () => {
    if (!appliedEvents) return [];

    if (selectedFilter === "all") return appliedEvents;

    return appliedEvents.filter((event) => {
      if (selectedFilter === "interested") return event.method === "INTERESTED";
      if (selectedFilter === "will_join") return event.method === "WILL_JOIN";
      return true;
    });
  };

  const getFilterStats = () => {
    const total = appliedEvents?.length || 0;
    const interested =
      appliedEvents?.filter((e) => e.method === "INTERESTED").length || 0;
    const willJoin =
      appliedEvents?.filter((e) => e.method === "WILL_JOIN").length || 0;
    const participated =
      appliedEvents?.filter((e) => e.isParticipated).length || 0;

    return { total, interested, willJoin, participated };
  };

  const renderHeader = () => {
    const stats = getFilterStats();

    return (
      <View style={styles.headerContainer}>
        {/* Hero Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.white} />
            <View style={styles.heroText}>
              <Text style={[globalStyles.h2, styles.heroTitle]}>
                My Applied Events
              </Text>
              <Text style={[styles.heroSubtitle]}>
                Track your event applications and participation
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.interested}</Text>
              <Text style={styles.statLabel}>Interested</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.willJoin}</Text>
              <Text style={styles.statLabel}>Will Join</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.participated}</Text>
              <Text style={styles.statLabel}>Participated</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {[
            { key: "all", label: "All Events", count: stats.total },
            { key: "interested", label: "Interested", count: stats.interested },
            { key: "will_join", label: "Will Join", count: stats.willJoin },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.activeFilterTabText,
                ]}
              >
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    selectedFilter === filter.key && styles.activeFilterBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      selectedFilter === filter.key &&
                        styles.activeFilterBadgeText,
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={COLORS.textTertiary} />
      <Text style={[globalStyles.h3, styles.emptyTitle]}>
        No Applied Events
      </Text>
      <Text style={[styles.emptySubtitle]}>
        You haven't applied to any events yet. Browse and apply to events to see
        them here.
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/")}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={20} color={COLORS.white} />
        <Text style={styles.browseButtonText}>Browse Events</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="warning-outline" size={80} color={COLORS.error} />
      <Text style={[globalStyles.h3, styles.errorTitle]}>
        Something went wrong
      </Text>
      <Text style={[styles.errorSubtitle]}>
        {appliedEventsError || "Failed to load your applied events"}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAppliedEvent = ({ item }: { item: AppliedEvent }) => (
    <AppliedEventCard appliedEvent={item} />
  );

  if (
    isLoadingAppliedEvents &&
    !refreshing &&
    (!appliedEvents || appliedEvents.length === 0)
  ) {
    return (
      <View style={globalStyles.centerContainer}>
        <Loading
          visible={true}
          message="Loading your applied events..."
          variant="overlay"
        />
      </View>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={filteredEvents}
        renderItem={renderAppliedEvent}
        keyExtractor={(item) => `${item.eventId}-${item.appliedAt}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.surface}
            title="Pull to refresh..."
            titleColor={COLORS.textSecondary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          appliedEventsError ? renderErrorState : renderEmptyState
        }
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
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    ...globalStyles.h3,
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...globalStyles.caption,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: LAYOUT.borderRadius.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    ...globalStyles.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  filterBadge: {
    marginLeft: SPACING.xs,
    backgroundColor: COLORS.textTertiary,
    borderRadius: LAYOUT.borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xs,
  },
  activeFilterBadge: {
    backgroundColor: COLORS.white,
  },
  filterBadgeText: {
    ...globalStyles.caption,
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 12,
  },
  activeFilterBadgeText: {
    color: COLORS.primary,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  separator: {
    height: SPACING.sm,
  },
  footer: {
    height: SPACING.enormous,
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
    marginBottom: SPACING.xl,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    ...LAYOUT.shadows.md,
  },
  browseButtonText: {
    ...globalStyles.bodyLarge,
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: SPACING.sm,
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
    marginBottom: SPACING.xl,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    ...LAYOUT.shadows.md,
  },
  retryButtonText: {
    ...globalStyles.bodyLarge,
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: SPACING.sm,
  },
});
