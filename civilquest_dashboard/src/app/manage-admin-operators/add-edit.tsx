"use client";

import React from "react";
import z, { email } from "zod";
import LoadingButton from "../../components/ui/button/index";

import { ApiResponse, AdminOperator } from "@/types";
import { useForm } from "@/hooks/useForm";
import { InputField } from "@/components/ui/input";
import { ComboBox } from "@/components/ui/comboBox";
import { cityWithProvince } from "@/utils/citiesWithProvince";

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
  city: z.string().min(2, "city must be specified"),
  province: z.string().min(2, "province must be specified"),
});

const UpdateAdminOperatorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long"),
  city: z.string().optional().or(z.literal("")),
  province: z.string().optional().or(z.literal("")),
});

const AddEdit = ({
  selectedAdminOperator,
  useAdminOperatorHook,
  handleClose,
}: AddEditProps) => {
  const schema = selectedAdminOperator
    ? UpdateAdminOperatorSchema
    : CreateAdminOperatorSchema;

  const { formData, handleChange, errors, validate } = useForm(
    {
      name: selectedAdminOperator?.name || "",
      email: selectedAdminOperator?.email || "",
      password: selectedAdminOperator?.password || "",
      phoneNumber: selectedAdminOperator?.phoneNumber || "",
      city: selectedAdminOperator?.city || "",
      province: "",
    },
    schema
  );

  const handleSubmit = async () => {
    let result: ApiResponse;
    if (validate()) {
      if (selectedAdminOperator) {
        const updatedAdminOperator: AdminOperator = {
          _id: selectedAdminOperator._id,
          name: formData.name,
          email: selectedAdminOperator.email,
          password: selectedAdminOperator.password as any,
          phoneNumber: formData.phoneNumber,
          city: selectedAdminOperator.city,
        };
        result =
          await useAdminOperatorHook.updateAdminOperator(updatedAdminOperator);
      } else {
        const createAdminOperator: AdminOperator = {
          name: formData.name,
          email: formData.email as string,
          password: formData.password as string,
          phoneNumber: formData.phoneNumber,
          city: formData.city as string,
        };
        result =
          await useAdminOperatorHook.createAdminOperator(createAdminOperator);
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
      {!selectedAdminOperator && (
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
      {!selectedAdminOperator && (
        <>
          <ComboBox
            name={"province"}
            label={"Province"}
            value={formData.province!}
            onChange={handleChange}
            error={errors.province}
            options={cityWithProvince.map((item) => ({
              value: item.province,
              name: item.province,
            }))}
          />

          <ComboBox
            name={"city"}
            label={"City"}
            value={formData.city!}
            onChange={handleChange}
            error={errors.city}
            options={(() => {
              const provinceObj = cityWithProvince.find(
                (item) => item.province === formData.province
              );
              if (provinceObj && Array.isArray(provinceObj.cites)) {
                return provinceObj.cites.map((city) => ({
                  value: city,
                  name: city,
                }));
              }
              return [];
            })()}
          />
        </>
      )}

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
