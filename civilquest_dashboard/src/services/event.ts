
import apiService from "./api-service";

export const getAdminEvents = async () => await apiService.get("events");

export const createEvent = async (data: any) =>
  await apiService.post("events", data);

export const updateEvent = async (data: {
  eventId: string;
  eventTitle?: string;
  reward?: string;
  eventDescription?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  city?: string;
  eventType?: string;
  province?: string;
  latitude?: string | number;
  longitude?: string | number;
}) => {
  const eid = String(data.eventId ?? "").trim();
  if (!eid) {
    throw new Error("eventId is required for updateEvent");
  }
  const payload: Record<string, any> = {};
  const keys: (keyof typeof data)[] = [
    "eventTitle",
    "eventDescription",
    "reward",
    "date",
    "startTime",
    "endTime",
    "location",
    "city",
    "eventType",
    "province",
    "latitude",
    "longitude",
  ];
  keys.forEach((k) => {
    const v = (data as any)[k];
    if (v !== undefined && v !== null && v !== "") payload[k as string] = v;
  });
  return await apiService.put("events/" + eid, payload);
};

export const deleteEvent = async (eventId: string) =>
  await apiService.delete("events/" + eventId);

export const approveEvent = async (eventId: string) =>
  await apiService.put("events/" + eventId + "/approve");

export const rejectEvent = async (eventId: string) =>
  await apiService.put("events/" + eventId + "/reject");

export const endEvent = async (eventId: string) =>
  await apiService.post("events/" + eventId + "/end");
