import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { EventCard, SearchAndFilter, Loading, Header } from "../../components";
import { useEvents } from "../../hooks";
import { globalStyles, COLORS, SPACING, LAYOUT } from "../../theme";
import { Event } from "../../types";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const router = useRouter();
  const {
    filteredEvents,
    isLoadingEvents,
    eventsError,
    loadEvents,
    filters,
    cities,
    eventTypes,
    updateFilters,
    clearFilters,
  } = useEvents();

  const [scrollY] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: "/events/details",
      params: { event: JSON.stringify(event) },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleSearchChange = (searchText: string) => {
    updateFilters({ search: searchText });
  };

  const handleCityChange = (city: string) => {
    updateFilters({ city });
  };

  const handleTypeChange = (type: string) => {
    updateFilters({ type });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item)}
      variant="default"
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={COLORS.textTertiary} />
      <Text style={[globalStyles.h3, styles.emptyTitle]}>No Events Found</Text>
      <Text style={[globalStyles.body, styles.emptySubtitle]}>
        {filters.search || filters.city || filters.type
          ? "No events match your search criteria. Try adjusting your filters."
          : "There are no approved events at the moment. Check back later!"}
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle" size={48} color={COLORS.error} />
      <Text style={[globalStyles.h4, styles.errorTitle]}>
        Unable to Load Events
      </Text>
      <Text style={[globalStyles.body, styles.errorSubtitle]}>
        {eventsError || "Something went wrong. Please try again."}
      </Text>
    </View>
  );

  const renderHeader = () => {
    const totalEvents = filteredEvents.length;

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
            <View style={styles.iconContainer}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroText}>
              <Text style={[globalStyles.h2, styles.heroTitle]}>
                CivilQuest
              </Text>
              <Text style={[styles.heroSubtitle]}>
                New Era of Community Service
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalEvents}</Text>
              <Text style={styles.statLabel}>Available Events</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="location-outline"
                size={21}
                color={COLORS.white}
                style={{ margin: SPACING.sm }}
              />
              <Text style={styles.statLabel}>Nationwide</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={21}
                color={COLORS.white}
                style={{ margin: SPACING.sm }}
              />
              <Text style={styles.statLabel}>Join Community</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });
  if (isLoadingEvents && !refreshing && filteredEvents.length === 0) {
    return (
      <View style={globalStyles.centerContainer}>
        <Loading visible={true} message="Loading events..." variant="overlay" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      {/* Custom Header */}
      <Animated.View style={{ opacity: headerOpacity }}>
        {renderHeader()}
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.surface}
          />
        }
      >
        {/* Search and Filter Section */}
        <View style={styles.searchSection}>
          <SearchAndFilter
            searchValue={filters.search}
            selectedCity={filters.city}
            selectedType={filters.type}
            cities={cities}
            eventTypes={eventTypes}
            onSearchChange={handleSearchChange}
            onCityChange={handleCityChange}
            onTypeChange={handleTypeChange}
            onClearFilters={handleClearFilters}
          />
        </View>

        {/* All Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[globalStyles.h3, styles.sectionTitle]}>
              All Events
            </Text>
            <Text style={[globalStyles.bodySmall, styles.sectionSubtitle]}>
              {filteredEvents.length} events found
            </Text>
          </View>

          {eventsError && renderError()}

          {filteredEvents.length === 0 &&
            !eventsError &&
            !isLoadingEvents &&
            renderEmptyState()}

          {filteredEvents.map((event) => (
            <View key={event.id} style={styles.eventCardContainer}>
              {renderEventCard({ item: event })}
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.surface,
  },
  heroSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.xl,
    padding: SPACING.sm,
    marginRight: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    ...LAYOUT.shadows.md,
  },
  appIcon: {
    width: 40,
    height: 40,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
    fontSize: 28,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + "20",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: "center",
  },
  headerGradient: {
    paddingBottom: SPACING.lg,
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  section: {
    marginTop: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    color: COLORS.textTertiary,
  },
  featuredList: {
    paddingLeft: SPACING.xl,
  },
  eventCardContainer: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.enormous,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    borderRadius: LAYOUT.borderRadius.xl,
    marginTop: SPACING.xxl,
  },
  emptyTitle: {
    textAlign: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    textAlign: "center",
    color: COLORS.textTertiary,
    maxWidth: 280,
  },
  errorState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.errorBg,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    borderRadius: LAYOUT.borderRadius.xl,
    borderWidth: 1,
    borderColor: COLORS.error + "20",
  },
  errorTitle: {
    textAlign: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: COLORS.error,
  },
  errorSubtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
    maxWidth: 280,
  },
  bottomSpacing: {
    height: SPACING.enormous,
  },
});
