import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  InputField,
  Button,
  CustomDateTimePicker,
  TimePicker,
} from "../../components";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { eventService } from "../../services/event";
import { CreateEventRequest } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function CreateEventScreen() {
  const { tokenUser } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00"); 
  const [reward, setReward] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user is premium
  const isPremium = tokenUser?.role === "PREMIUM_USER";

  if (!isPremium) {
    return (
      <View style={[globalStyles.container, styles.centered]}>
        <LinearGradient
          colors={[COLORS.primary + "15", COLORS.secondary + "15"]}
          style={styles.premiumBackground}
        />
        <View style={styles.premiumIconContainer}>
          <Ionicons name="diamond-outline" size={64} color={COLORS.warning} />
        </View>
        <Text style={styles.premiumTitle}>Premium Feature</Text>
        <Text style={styles.premiumMessage}>
          Only Premium users can create events. Upgrade your account to start
          organizing amazing events.
        </Text>
        <Button
          title="Upgrade to Premium"
          onPress={() => router.push("/profile/apply-premium")}
          style={styles.upgradeButton}
        />
        <Button
          title="Go Back"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!eventTitle.trim()) newErrors.eventTitle = "Event title is required";
    if (!eventDescription.trim())
      newErrors.eventDescription = "Event description is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!eventType.trim()) newErrors.eventType = "Event type is required";
    if (!reward.trim()) newErrors.reward = "Reward is required";

    if (reward && isNaN(Number(reward))) {
      newErrors.reward = "Reward must be a valid number";
    }

    // Validate start and end times
    const [startHours, startMinutes] = eventTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes <= startTimeInMinutes) {
      newErrors.endTime = "End time must be after start time";
    }

    // Check if event date is in the future
    const selectedDateTime = new Date(eventDate);
    const [hours, minutes] = eventTime.split(":");
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (selectedDateTime <= new Date()) {
      newErrors.eventDate = "Event date and time must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create the base date
      const baseDate = new Date(eventDate);
      const dateString = baseDate.toISOString().split("T")[0]; // YYYY-MM-DD

      const eventData: CreateEventRequest = {
        eventTitle: eventTitle.trim(),
        eventType: eventType.trim(),
        eventDescription: eventDescription.trim(),
        location: location.trim(),
        city: city.trim(),
        date: dateString,
        startTime: eventTime,
        endTime: endTime,
        reward: reward.trim(),
      };

      // Prepare image file if selected
      let imageFile = null;
      if (selectedImage) {
        // Create a file object for the image
        const filename = selectedImage.split("/").pop() || "event-image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        imageFile = {
          uri: selectedImage,
          name: filename,
          type: type,
        } as any;
      }

      const res = await eventService.createEvent(eventData, imageFile);
      if (res.success === true) {
        Alert.alert("Success", "Event created successfully!", [
          { text: "OK", onPress: () => router.push("/profile/manage-events") },
        ]);
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create event"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectImage = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to select an image."
      );
      return;
    }

    Alert.alert(
      "Select Image",
      "Choose how you want to add an image for your event",
      [
        {
          text: "Camera",
          onPress: async () => {
            const cameraStatus =
              await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== "granted") {
              Alert.alert(
                "Permission Required",
                "Sorry, we need camera permissions to take a photo."
              );
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setSelectedImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setSelectedImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backIconContainer}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Create New Event</Text>
              <Text style={styles.headerSubtitle}>
                Fill in the details to create your event
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <Ionicons
                name="calendar-outline"
                size={32}
                color={COLORS.surface}
              />
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <InputField
            label="Event Title"
            placeholder="Enter event title"
            value={eventTitle}
            onChangeText={setEventTitle}
            error={errors.eventTitle}
            required
          />

          <InputField
            label="Event Description"
            placeholder="Describe your event"
            value={eventDescription}
            onChangeText={setEventDescription}
            error={errors.eventDescription}
            multiline
            numberOfLines={4}
            required
          />

          {/* Image Picker */}
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Event Image (Optional)</Text>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={selectImage}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={32} color={COLORS.textTertiary} />
                <Text style={styles.imagePickerText}>Add Event Image</Text>
                <Text style={styles.imagePickerSubtext}>
                  Tap to select from camera or gallery
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <InputField
            label="Location"
            placeholder="Event venue/location"
            value={location}
            onChangeText={setLocation}
            error={errors.location}
            required
          />

          <InputField
            label="City"
            placeholder="City where event takes place"
            value={city}
            onChangeText={setCity}
            error={errors.city}
            required
          />

          <CustomDateTimePicker
            label="Event Date"
            value={eventDate}
            mode="date"
            onChange={setEventDate}
            placeholder="Select event date"
            error={errors.eventDate}
            minimumDate={new Date()}
            required
          />

          <TimePicker
            label="Start Time"
            value={eventTime}
            onChange={setEventTime}
            placeholder="Select start time"
            error={errors.eventTime}
            required
          />

          <TimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
            placeholder="Select end time"
            error={errors.endTime}
            required
          />

          <InputField
            label="Event Type"
            placeholder="e.g., Environmental, Construction, Social"
            value={eventType}
            onChangeText={setEventType}
            error={errors.eventType}
            required
          />

          <InputField
            label="Reward"
            placeholder="Enter reward amount"
            value={reward}
            onChangeText={setReward}
            error={errors.reward}
            keyboardType="numeric"
            required
          />

          <Button
            title={loading ? "Creating Event..." : "Create Event"}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  form: {
    flex: 1,
    padding: SPACING.lg,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
  },
  premiumBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  premiumIconContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 32,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  premiumMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  upgradeButton: {
    marginBottom: SPACING.md,
    minWidth: 200,
  },
  backButton: {
    marginTop: SPACING.sm,
    minWidth: 200,
  },
  header: {
    marginHorizontal: -SPACING.md,
    marginTop: -SPACING.md,
    marginBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xl + 20,
  },
  backIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.surface,
    opacity: 0.9,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Image Picker Styles
  imageSection: {
    marginBottom: SPACING.lg,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: COLORS.backgroundSecondary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    minHeight: 120,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  imagePickerSubtext: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    height: 200,
    width: "100%",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
  },
  imageSelectedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
