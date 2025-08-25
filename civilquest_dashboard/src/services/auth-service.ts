import { toast } from "react-toastify";
import apiService from "./api-service";

export interface LoginDTO {
  email: string;
  password: string;
}

//login
export const login = async (data: LoginDTO) =>
  await apiService.post("/auth/login", data);
