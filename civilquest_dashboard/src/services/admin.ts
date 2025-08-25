
import { ProvincialAdmin } from "@/types";
import apiService from "./api-service";

export const createAdmin = async (data: ProvincialAdmin) =>
  await apiService.post("/accounts/admins", {
    name: data.name,
    email: data.email,
    password: data.password,
    phoneNumber: data.phoneNumber,
    province: data.province,
  });

export const getAllAdmin = async () => await apiService.get(`/accounts/admins`);

export const updateAdmin = async (data: ProvincialAdmin) => {
  return await apiService.put(`/accounts/admins/${data._id?.$oid}`, {
    name: data.name,
    phoneNumber: data.phoneNumber,
  });
};

export const deleteAdmin = async (id: string) => {
  return await apiService.delete(`/accounts/admins/${id}`);
};
