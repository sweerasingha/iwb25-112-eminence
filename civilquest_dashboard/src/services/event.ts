
import apiService from "./api-service";

export const getAdminEvents = async () => await apiService.get("events");

export const createEvent = async (data: any) =>
  await apiService.post("events", data);

export const updateEvent = async (data: {
  eventId: string;
  eventTitle: string;
  reward: string;
  eventDescription: string;
}) =>
  await apiService.put("events/" + data.eventId, {
    eventTitle: data.eventTitle,
    eventDescription: data.eventDescription,
    reward: data.reward,
  });

export const deleteEvent = async (eventId: string) =>
  await apiService.delete("events/" + eventId);

export const approveEvent = async (eventId: string) =>
  await apiService.put("events/" + eventId + "/approve");

export const rejectEvent = async (eventId: string) =>
  await apiService.put("events/" + eventId + "/reject");

export const endEvent = async (eventId: string) =>
  await apiService.post("events/" + eventId + "/end");
