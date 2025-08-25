"use client";

import React from "react";
import z from "zod";
import LoadingButton from "../../components/ui/button/index";

import { ApiResponse } from "@/types";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";

import {
  createApiCompliantFormData,
} from "@/utils/api-validation";

interface CreateProps {
  useEventHook: any;
  handleClose: () => void;
}
const editEvent = z.object({
  date: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  eventTitle: z.string().min(1, "Event title is required"),
  eventDescription: z
    .string()
    .min(20, "Event description is required 20 characters minimum"),
  eventType: z.string().min(1, "Event type is required"),
  reward: z.string().min(1, "Reward is required"),
  image: z.any().optional(), 
});

const Create = ({ useEventHook, handleClose }: CreateProps) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const { formData, handleChange, errors, validate } = useForm(
    {
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      city: "",
      eventTitle: "",
      eventDescription: "",
      eventType: "Environmental",
      reward: "",
      image: null,
    },
    editEvent
  );

  const handleSubmit = async () => {
    let result: ApiResponse;

    if (validate()) {
      try {
        const data = createApiCompliantFormData(formData, selectedFile);

        result = await useEventHook.createEvent(data);
        if (result.status) {
          await useEventHook.fetchEvents();
          handleClose();
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
        result = { status: false };
      }
    } else {
      console.log("Form validation failed:", errors);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
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
        name={"city"}
        label={"City"}
        value={formData.city}
        onChange={handleChange}
        error={errors.city}
      />

      <InputField
        name={"eventTitle"}
        label={"Event Title"}
        value={formData.eventTitle}
        onChange={handleChange}
        error={errors.eventTitle}
      />
      <InputField
        name={"eventType"}
        label={"Event Type"}
        value={formData.eventType}
        onChange={handleChange}
        error={errors.eventType}
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

      <div className="flex flex-col space-y-2">
        <label htmlFor="image" className="text-sm font-medium text-gray-700">
          Event Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <LoadingButton
          onClick={async () => {
            await handleSubmit();
          }}
          children={"Save Changes"}
        />
      </div>
    </div>
  );
};

export default Create;
