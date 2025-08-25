"use client";

import React from "react";
import z, { email } from "zod";
import LoadingButton from "../../components/ui/button/index";

import { ApiResponse, Event } from "@/types";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";

interface AddEditProps {
  selectedEvent?: Event;
  useEventHook: any;
  handleClose: () => void;
}
const editEvent = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  reward: z.string().min(1, "Reward is required"),
});

const AddEdit = ({
  selectedEvent,
  useEventHook,
  handleClose,
}: AddEditProps) => {
  const { formData, handleChange, errors, validate } = useForm(
    {
      eventTitle: selectedEvent?.eventTitle || "",
      eventDescription: selectedEvent?.eventDescription || "",
      reward: selectedEvent?.reward || "",
    },
    editEvent
  );

  const handleSubmit = async () => {
    let result: ApiResponse;
    if (validate()) {
      if (selectedEvent) {
        const updatedEvent = {
          eventId: selectedEvent._id,
          eventTitle: formData.eventTitle,
          eventDescription: formData.eventDescription,
          reward: formData.reward,
        };

        result = await useEventHook.updateEvent(updatedEvent);

        if (result.status) {
          await useEventHook.fetchEvents();
          handleClose();
        }
      }
    }
  };
  return (
    <div className="flex flex-col space-y-4">
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
          await handleSubmit();
        }}
        children={"Save Changes"}
      />
    </div>
  );
};

export default AddEdit;
