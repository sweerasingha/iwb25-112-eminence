"use client";

import React, { useEffect, useMemo, useState } from "react";
import z, { email } from "zod";
import LoadingButton from "../../components/ui/button/index";

import { ApiResponse, Event } from "@/types";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";
import { ComboBox } from "@/components/ui/comboBox";
import { getProvinces, ProvinceCityMap } from "@/services/provinces";

interface AddEditProps {
  selectedEvent?: Event;
  useEventHook: any;
  handleClose: () => void;
}
const EVENT_TYPES = [
  "Environmental",
  "Community Service",
  "Education",
  "Health & Wellness",
  "Sports",
  "Arts & Culture",
  "Fundraising",
  "Other",
] as const;

const editEvent = z.object({
  date: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  eventTitle: z.string().min(1, "Event title is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  reward: z.string().min(1, "Reward is required"),
});

const AddEdit = ({
  selectedEvent,
  useEventHook,
  handleClose,
}: AddEditProps) => {
  const [provinceMap, setProvinceMap] = useState<ProvinceCityMap>({});
  const { formData, handleChange, errors, validate, setFormData } = useForm(
    {
      date: selectedEvent?.date || "",
      startTime: selectedEvent?.startTime || "",
      endTime: selectedEvent?.endTime || "",
  location: selectedEvent?.location || "",
      eventTitle: selectedEvent?.eventTitle || "",
      eventDescription: selectedEvent?.eventDescription || "",
      reward: selectedEvent?.reward || "",
    },
    editEvent
  );

  useEffect(() => {
    getProvinces().then(setProvinceMap).catch(() => setProvinceMap({}));
  }, []);
  const provinceOptions = [] as any[];
  const cityOptions = [] as any[];

  const handleSubmit = async () => {
    let result: ApiResponse;
    if (validate()) {
      if (selectedEvent) {
        const updatedEvent: any = {
          eventId: (selectedEvent._id || selectedEvent.id),
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          eventTitle: formData.eventTitle,
          eventDescription: formData.eventDescription,
          reward: formData.reward,
        };
        result = await useEventHook.updateEvent(updatedEvent);

        if (result.status) {
          // Refresh without blocking the dialog button spinner
          useEventHook.fetchEvents();
          handleClose();
        }
      }
    }
  };
  return (
    <div className="flex flex-col space-y-4">
      {selectedEvent?.status === "APPROVED" && (
        <div className="text-red-600 text-sm">Approved events cannot be edited.</div>
      )}
      <InputField
        name={"date"}
        label={"Event Date"}
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        type="date"
      />
      <InputField
        name={"startTime"}
        label={"Start Time"}
        value={formData.startTime}
        onChange={handleChange}
        error={errors.startTime}
        type="time"
      />
      <InputField
        name={"endTime"}
        label={"End Time"}
        value={formData.endTime}
        onChange={handleChange}
        error={errors.endTime}
        type="time"
      />
      <InputField
        name={"location"}
        label={"Location"}
        value={formData.location}
        onChange={handleChange}
        error={errors.location}
      />
      <InputField
        name={"eventTitle"}
        label={"Event Title"}
        value={formData.eventTitle}
        onChange={handleChange}
        error={errors.eventTitle}
      />
      <InputField
        name={"eventDescription"}
        label={"Event Description"}
        value={formData.eventDescription}
        onChange={handleChange}
        error={errors.eventDescription}
      />
      <InputField
        name={"reward"}
        label={"Reward"}
        value={formData.reward}
        onChange={handleChange}
        error={errors.reward}
      />

      <LoadingButton
        onClick={async () => {
          if (selectedEvent?.status === "APPROVED") return;
          await handleSubmit();
        }}
        disabled={selectedEvent?.status === "APPROVED"}
        children={"Save Changes"}
      />
    </div>
  );
};

export default AddEdit;
