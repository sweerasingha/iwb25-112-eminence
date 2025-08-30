import React from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import {
  ManageEventCard,
  EditEventModal,
  SponsorsModal,
  EmptyEventsState,
  LoadingState,
  PremiumAccessGuard,
  ManageEventsHeader,
} from "../../components/EventManagement";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { useManageEvents } from "../../hooks/useManageEvents";
import { Loading } from "components";

export default function ManageMyEventsScreen() {
  const {
    myEvents,
    isPremium,
    refreshing,
    editModalVisible,
    sponsorsModalVisible,
    selectedEvent,
    sponsors,
    loadingSponsors,
    sponsorActions,
    sponsorActionType,
    participationActions,
    updating,
    handleRefresh,
    handleCreateEvent,
    handleEventAction,
    handleUpdateEvent,
    handleApproveSponsor,
    handleRejectSponsor,
    setEditModalVisible,
    setSponsorsModalVisible,
  } = useManageEvents();

  const renderEventCard = ({ item }: { item: any }) => (
    <ManageEventCard
      event={item}
      onEventAction={handleEventAction}
      participationActions={participationActions}
      loadingSponsors={loadingSponsors}
      selectedEventId={selectedEvent?.id}
    />
  );

  return (
    <PremiumAccessGuard isPremium={isPremium}>
      <View style={[globalStyles.container, { flex: 1 }]}>
        <ManageEventsHeader
          eventsCount={myEvents.data.length}
          onCreateEvent={handleCreateEvent}
        />

        {myEvents.loading === "loading" && myEvents.data.length === 0 ? (
          <View style={globalStyles.centerContainer}>
            <Loading
              visible={true}
              message="Loading events..."
              variant="overlay"
            />
          </View>
        ) : myEvents.data.length === 0 ? (
          <EmptyEventsState onCreateEvent={handleCreateEvent} />
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={myEvents.data}
              keyExtractor={(item) => item.id}
              renderItem={renderEventCard}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={COLORS.primary}
                  colors={[COLORS.primary]}
                />
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Edit Event Modal */}
        <EditEventModal
          visible={editModalVisible}
          event={selectedEvent}
          updating={updating}
          onClose={() => setEditModalVisible(false)}
          onUpdate={handleUpdateEvent}
        />

        {/* Sponsors Modal */}
        <SponsorsModal
          visible={sponsorsModalVisible}
          event={selectedEvent}
          sponsors={sponsors}
          sponsorActions={sponsorActions}
          sponsorActionType={sponsorActionType}
          onClose={() => setSponsorsModalVisible(false)}
          onApproveSponsor={handleApproveSponsor}
          onRejectSponsor={handleRejectSponsor}
        />
      </View>
    </PremiumAccessGuard>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    paddingTop: SPACING.sm,
  },
});
