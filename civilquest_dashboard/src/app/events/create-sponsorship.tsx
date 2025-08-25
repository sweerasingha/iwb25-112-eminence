"use client";

import React  from "react";
import z from "zod";
import LoadingButton from "../../components/ui/button/index";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";
import useSponsorRequest from "@/hooks/useSponsors";
import { toast } from "react-toastify";
import { ComboBox } from "@/components/ui/comboBox";
import { TextAreaField } from "@/components/ui/textarea";
import { useUserContext } from "@/context/userContext";

interface CreateSponsorshipProps {
  eventId: string;
  handleClose: () => void;
}

const createSponsorshipSchema = z.object({
  sponsorType: z.string().min(1, "Sponsor type is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const CreateSponsorship = ({
  handleClose,
  eventId,
}: CreateSponsorshipProps) => {
  const { user } = useUserContext();
  const useSponsorHook = useSponsorRequest();

  const { formData, handleChange, errors, validate } = useForm(
    {
      sponsorType: "Gold",
      amount: "",
      description: "",
    },
    createSponsorshipSchema
  );

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      const result = await useSponsorHook.createSponsorship({
        adminOperatorId: user?.email!,
        eventId: eventId,
        sponsorType: formData.sponsorType,
        amount: Number(formData.amount),
        description: formData.description,
      });

      if (result.success) {
        handleClose();
      }
    } catch (error) {
      console.error("Error creating sponsorship:", error);
    }
  };

  const sponsorTypes = [
    { value: "Gold", label: "Gold Sponsor" },
    { value: "Silver", label: "Silver Sponsor" },
    { value: "Bronze", label: "Bronze Sponsor" },
    { value: "Platinum", label: "Platinum Sponsor" },
    { value: "Title", label: "Title Sponsor" },
    { value: "Partner", label: "Partner" },
  ];

  return (
    <div className="">
      <ComboBox
        label="Sponsorship Type"
        name={"Sponsorship Type"}
        options={[{ value: "AMOUNT", name: "AMOUNT" }]}
        value={formData.sponsorType}
        onChange={handleChange}
        error={errors.sponsorType}
      />

      <InputField
        name="amount"
        label="Amount *"
        value={formData.amount}
        onChange={handleChange}
        error={errors.amount}
        type="number"
      />

      <TextAreaField
        name="description"
        label="Description *"
        value={formData.description}
        onChange={handleChange as any}
        error={errors.description}
      />

      <div className="flex justify-center space-x-4 pt-4">
        <LoadingButton
          onClick={async () => {
            await handleSubmit();
          }}
          children="Create Sponsorship"
        />
      </div>
    </div>
  );
};

export default CreateSponsorship;
