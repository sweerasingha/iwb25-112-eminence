"use client";

import React from "react";
import z, { email } from "zod";
import LoadingButton from "../../components/ui/button/index";

import { ApiResponse, AdminOperator } from "@/types";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";

interface AddEditProps {
  selectedAdminOperator?: AdminOperator;
  useAdminOperatorHook: any;
  handleClose: () => void;
}
const CreateAdminOperatorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long"),
  city: z.string().min(2, "city must be at least 2 characters long"),
});

const AddEdit = ({
  selectedAdminOperator,
  useAdminOperatorHook,
  handleClose,
}: AddEditProps) => {
  const { formData, handleChange, errors, validate } = useForm(
    {
      name: selectedAdminOperator?.name || "",
      email: selectedAdminOperator?.email || "",
      password: selectedAdminOperator?.password || "",
      phoneNumber: selectedAdminOperator?.phoneNumber || "",
      city: selectedAdminOperator?.city || "",
    },
    CreateAdminOperatorSchema
  );

  const handleSubmit = async () => {
    let result: ApiResponse;
    if (validate()) {
      if (selectedAdminOperator) {
        const updatedAdminOperator: AdminOperator = {
          _id: selectedAdminOperator._id,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
        };
        result =
          await useAdminOperatorHook.updateAdminOperator(updatedAdminOperator);
      } else {
        const createAdminOperator: AdminOperator = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
        };
        result =
          await useAdminOperatorHook.createAdminOperator(createAdminOperator);
      }
      if (result.status) {
        await useAdminOperatorHook.fetchAdminOperators();
        handleClose();
      }
    }
  };
  return (
    <div className="flex flex-col space-y-4">
      <InputField
        name={"name"}
        label={"Name"}
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      <InputField
        name={"email"}
        label={"Email"}
        type={"email"}
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />
      <InputField
        name={"password"}
        label={"Password"}
        type={"password"}
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />
      <InputField
        name={"phoneNumber"}
        label={"Phone Number"}
        value={formData.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
      />
      <InputField
        name={"city"}
        label={"City"}
        value={formData.city}
        onChange={handleChange}
        error={errors.city}
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
