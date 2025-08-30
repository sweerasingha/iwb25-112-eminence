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

const createSponsorshipSchema = z
  .object({
    sponsorType: z.enum(["AMOUNT", "DONATION"] as const),
    amount: z.string().optional().default(""),
    donationAmount: z.string().optional().default(""),
    donation: z.string().optional().default(""),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.sponsorType === "AMOUNT") {
      if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be a positive number",
          path: ["amount"],
        });
      }
    } else if (data.sponsorType === "DONATION") {
      const hasDonationAmount = !!data.donationAmount && !isNaN(Number(data.donationAmount)) && Number(data.donationAmount) > 0;
      const hasDonationText = !!data.donation && data.donation.trim().length > 0;
      if (!hasDonationAmount && !hasDonationText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide donation amount or details",
          path: ["donationAmount"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide donation amount or details",
          path: ["donation"],
        });
      } else if (!!data.donationAmount && (isNaN(Number(data.donationAmount)) || Number(data.donationAmount) <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Donation amount must be a positive number",
          path: ["donationAmount"],
        });
      }
    }
  });

const CreateSponsorship = ({
  handleClose,
  eventId,
}: CreateSponsorshipProps) => {
  const { user } = useUserContext();
  const useSponsorHook = useSponsorRequest();

  const { formData, handleChange, errors, validate, setFormData } = useForm(
    {
      sponsorType: "AMOUNT",
      amount: "",
      donationAmount: "",
      donation: "",
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
      const adminOperatorId = String(user?.email || "").trim();
      if (!adminOperatorId) {
        toast.error("Missing admin operator identity");
        return;
      }

      const eid = String(eventId || "").trim();
      if (!eid) {
        toast.error("Invalid event id");
        return;
      }

      const payload: any = {
        adminOperatorId,
        eventId: eid,
        sponsorType: formData.sponsorType,
        description: formData.description,
      };
      if (formData.sponsorType === "AMOUNT") {
        payload.amount = Number(formData.amount);
      } else {
        if (formData.donationAmount) payload.donationAmount = Number(formData.donationAmount);
        if (formData.donation) payload.donation = formData.donation;
      }

      const result = await useSponsorHook.createSponsorship(payload);

      if (result.success) {
        handleClose();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error creating sponsorship:", error);
    }
  };

  const sponsorTypes = [
    { value: "AMOUNT", name: "Money (Amount)" },
    { value: "DONATION", name: "In-kind Donation" },
  ];

  return (
    <div className="">
      <ComboBox
        label="Sponsorship Type"
        name={"sponsorType"}
        options={sponsorTypes}
        value={formData.sponsorType}
        onChange={(e) => {
          handleChange(e as any);
          // reset conditional fields when type changes
          const nextType = (e.target as HTMLSelectElement).value;
          if (nextType === "AMOUNT") {
            setFormData((prev: any) => ({ ...prev, donationAmount: "", donation: "" }));
          } else {
            setFormData((prev: any) => ({ ...prev, amount: "" }));
          }
        }}
        error={errors.sponsorType as string}
      />

      {formData.sponsorType === "AMOUNT" && (
        <InputField
          name="amount"
          label="Amount *"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount as string}
          type="number"
        />
      )}

      {formData.sponsorType === "DONATION" && (
        <>
          <InputField
            name="donationAmount"
            label="Donation Amount (optional)"
            value={formData.donationAmount}
            onChange={handleChange}
            error={errors.donationAmount as string}
            type="number"
          />
          <TextAreaField
            name="donation"
            label="Donation Details (optional)"
            value={formData.donation}
            onChange={handleChange}
            error={errors.donation as string}
          />
        </>
      )}

      <TextAreaField
        name="description"
        label="Description *"
        value={formData.description}
        onChange={handleChange}
        error={errors.description as string}
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
