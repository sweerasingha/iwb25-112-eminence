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
import { set, z } from "zod";
import { RootState } from "../../store";
import {
  InputField,
  Button,
  CustomDateTimePicker,
  TimePicker,
} from "../../components";
import { globalStyles, COLORS, SPACING } from "../../theme";
import { eventService } from "../../services/event";
import { CreateEventRequest, EventLocation } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { GetSelectedLocation } from "../../components";
import { useForm } from "../../hooks";
import { ComboBox } from "components/UI/ComboBox";
import { cityWithProvince } from "utils/citiesWithProvince";
import { eventTypes } from "utils/eventTypes";

const { width } = Dimensions.get("window");

// Create form schema
const createEventSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  eventType: z.string().min(1, "Event type is required"),
  reward: z
    .string()
    .min(1, "Reward is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Reward must be a valid number",
    }),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export default function CreateEventScreen() {
  const { tokenUser } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<EventLocation | null>(null);
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState("");
  const [dateTimeError, setDateTimeError] = useState("");

  const {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validate,
    getFieldProps,
  } = useForm<CreateEventFormData>(
    {
      eventTitle: "",
      eventDescription: "",
      province: "",
      city: "",
      eventType: "",
      reward: "",
    },
    createEventSchema
  );

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
    // First validate the form schema
    const isValidForm = validate();

    // Then validate custom fields
    setLocationError("");
    setDateTimeError("");

    let hasErrors = false;

    if (!location?.displayName.trim()) {
      setLocationError("Location is required");
      hasErrors = true;
    }

    // Validate start and end times
    const [startHours, startMinutes] = eventTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes <= startTimeInMinutes) {
      setDateTimeError("End time must be after start time");
      hasErrors = true;
    }

    // Check if event date is in the future
    const selectedDateTime = new Date(eventDate);
    const [hours, minutes] = eventTime.split(":");
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (selectedDateTime <= new Date()) {
      setDateTimeError("Event date and time must be in the future");
      hasErrors = true;
    }

    return isValidForm && !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create the base date
      const baseDate = new Date(eventDate);
      const dateString = baseDate.toISOString().split("T")[0]; // YYYY-MM-DD

      const eventData: CreateEventRequest = {
        eventTitle: formData.eventTitle.trim(),
        eventType: formData.eventType.trim(),
        eventDescription: formData.eventDescription.trim(),
        location: location!.displayName.trim(),
        province: formData.province.trim(),
        city: formData.city.trim(),
        date: dateString,
        startTime: eventTime,
        endTime: endTime,
        reward: formData.reward.trim(),
        longitude: location!.longitude,
        latitude: location!.latitude,
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
            {...getFieldProps("eventTitle")}
            error={touched.eventTitle ? errors.eventTitle : undefined}
            required
          />

          <InputField
            label="Event Description"
            placeholder="Describe your event"
            {...getFieldProps("eventDescription")}
            error={
              touched.eventDescription ? errors.eventDescription : undefined
            }
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

          <GetSelectedLocation
            validationError={locationError}
            setLocation={setLocation}
          />
          <ComboBox
            label="Province"
            value={formData.province}
            options={cityWithProvince.map((item) => item.Province)}
            onChange={(value) => handleChange("province", value)}
            error={errors.province}
          />

          <ComboBox
            label="City"
            value={formData.city}
            options={
              cityWithProvince.find(
                (item) => item.Province === formData.province
              )?.cites || []
            }
            onChange={(value) => handleChange("city", value)}
            error={errors.city}
          />

          <CustomDateTimePicker
            label="Event Date"
            value={eventDate}
            mode="date"
            onChange={setEventDate}
            placeholder="Select event date"
            error={dateTimeError}
            minimumDate={new Date()}
            required
          />

          <TimePicker
            label="Start Time"
            value={eventTime}
            onChange={setEventTime}
            placeholder="Select start time"
            error={dateTimeError}
            required
          />

          <TimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
            placeholder="Select end time"
            error={dateTimeError}
            required
          />

          <ComboBox
            label="Event Type"
            value={formData.eventType}
            options={eventTypes}
            onChange={(value) => handleChange("eventType", value)}
            error={errors.eventType}
          />

          <InputField
            label="Reward"
            placeholder="Enter reward amount"
            {...getFieldProps("reward")}
            error={touched.reward ? errors.reward : undefined}
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
