"use client";

import React from "react";
import z, { email } from "zod";
import LoadingButton from "../../components/ui/button/index";

import { ApiResponse, ProvincialAdmin } from "@/types";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";
import { ComboBox } from "@/components/ui/comboBox";

interface AddEditProps {
  selectedAdmin?: ProvincialAdmin;
  useAdminHook: any;
  handleClose: () => void;
}
const PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
] as const;

const ProvinceEnum = z.enum(PROVINCES);
const ProvinceField = z
  .union([ProvinceEnum, z.literal("")])
  .refine((v) => v !== "", { message: "Please select a province" });

const CreateAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long"),
  province: ProvinceField,
});

const UpdateAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long"),
  province: ProvinceField,
});

const AddEdit = ({
  selectedAdmin,
  useAdminHook,
  handleClose,
}: AddEditProps) => {
  const schema = selectedAdmin ? UpdateAdminSchema : CreateAdminSchema;

  type Province = (typeof PROVINCES)[number];
  const initialProvince: Province | "" = (() => {
    const p = selectedAdmin?.province ?? "";
    return (PROVINCES as readonly string[]).includes(p) ? (p as Province) : "";
  })();

  const { formData, handleChange, errors, validate } = useForm(
    {
      name: selectedAdmin?.name || "",
      email: selectedAdmin?.email || "",
      password: selectedAdmin?.password || "",
      phoneNumber: selectedAdmin?.phoneNumber || "",
      province: initialProvince,
    },
    schema
  );

  const handleSubmit = async () => {
    let result: ApiResponse;
    if (validate()) {
      if (selectedAdmin) {
        const updatedAdmin: ProvincialAdmin = {
          _id: selectedAdmin._id,
          name: formData.name,
          email: selectedAdmin.email,
          phoneNumber: formData.phoneNumber,
          province: formData.province,
        };
        result = await useAdminHook.updateAdmin(updatedAdmin);
      } else {
        const createAdmin: ProvincialAdmin = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          province: formData.province,
        };
        result = await useAdminHook.createAdmin(createAdmin);
      }
      if (result.status) {
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
      {!selectedAdmin && (
        <>
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
            showToggle
            error={errors.password}
          />
        </>
      )}
      <InputField
        name={"phoneNumber"}
        label={"Phone Number"}
        value={formData.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
      />
      <ComboBox
        name={"province"}
        label={"Province"}
        value={formData.province}
        onChange={handleChange as any}
        options={PROVINCES.map((p) => ({ name: p, value: p }))}
        error={errors.province as string}
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
