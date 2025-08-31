// Validation utilities for API requirements
export const isAlphanumericOnly = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

export const isSafeText = (value: string): boolean => {
  return /^[a-zA-Z0-9\s\.,;:!\?'"()\-_/&@#%\+]*$/.test(value);
};

export const validateApiRequirements = (formData: any) => {
  console.log("=== API REQUIREMENTS VALIDATION ===");

  let allValid = true;

  ["eventDescription", "eventTitle", "location"].forEach((field) => {
    const value = formData[field];
    const ok = value && isSafeText(value.toString());
    if (!ok) allValid = false;
  });

  const rewardVal = formData["reward"];
  if (!rewardVal || !/^[0-9]+$/.test(String(rewardVal))) {
    allValid = false;
  }

  const generalFields = [
    "date",
    "startTime",
    "endTime",
    "city",
    "eventType",
    "province",
    "latitude",
    "longitude",
  ];

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
  data.append("location", formData.location);
  data.append("city", formData.city);
  if (formData.province) data.append("province", formData.province);
  if (formData.latitude) data.append("latitude", formData.latitude);
  if (formData.longitude) data.append("longitude", formData.longitude);
  data.append("eventTitle", formData.eventTitle);
  data.append("eventType", formData.eventType);
  data.append("eventDescription", formData.eventDescription);
  data.append("reward", sanitizeForApi(formData.reward));

  if (file) {
    data.append("image", file);
  }

  return data;
};
