// Validation utilities for API requirements
export const isAlphanumericOnly = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

export const validateApiRequirements = (formData: any) => {
  console.log("=== API REQUIREMENTS VALIDATION ===");

  const alphanumericFields = [
    "eventDescription",
    "eventTitle",
    "location",
    "reward",
  ];

  let allValid = true;

  alphanumericFields.forEach((field) => {
    const value = formData[field];
    const isValid = value && isAlphanumericOnly(value.toString());
    if (!isValid) {
      allValid = false;
    }
  });

  const generalFields = ["date", "startTime", "endTime", "city", "eventType"];

  generalFields.forEach((field) => {
    const value = formData[field];
    const isValid = value && value.toString().trim() !== "";
    if (!isValid) allValid = false;
  });

  return allValid;
};

export const sanitizeForApi = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, "");
};

export const createApiCompliantFormData = (
  formData: any,
  file: File | null
) => {
  const data = new FormData();

  data.append("date", formData.date);
  data.append("startTime", formData.startTime);
  data.append("endTime", formData.endTime);
  data.append("location", sanitizeForApi(formData.location));
  data.append("city", formData.city);
  data.append("eventTitle", sanitizeForApi(formData.eventTitle));
  data.append("eventType", formData.eventType);
  data.append("eventDescription", sanitizeForApi(formData.eventDescription));
  data.append("reward", sanitizeForApi(formData.reward));

  if (file) {
    data.append("image", file);
  }

  return data;
};
