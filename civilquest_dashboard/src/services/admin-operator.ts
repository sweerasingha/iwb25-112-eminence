import { AdminOperator } from "@/types";
import apiService from "./api-service";

export const createAdminOperator = async (data: AdminOperator) =>
  await apiService.post("/accounts/admin_operators", {
    name: data.name,
    email: data.email,
    password: data.password,
    phoneNumber: data.phoneNumber,
    city: data.city,
  });

export const getAllAdminOperators = async () =>
  await apiService.get(`/accounts/admin_operators`);

export const updateAdminOperator = async (data: AdminOperator) => {
  return await apiService.put(`/accounts/admin_operators/${data._id?.$oid}`, {
    name: data.name,
    phoneNumber: data.phoneNumber,
  });
};

export const deleteAdminOperator = async (id: string) => {
  return await apiService.delete(`/accounts/admin_operators/${id}`);
};
