import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { STORAGE_KEYS } from "@/config";
const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getErrorMessage = (error: {
  response: { data: { message: unknown } };
  request: unknown;
}) => {
  if (error.response) {
    return error.response.data.message || "Server error";
  } else if (error.request) {
    return "No response from server";
  } else {
    return "Request failed";
  }
};

const simulateNetworkDelay = () => {
  const delay = 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

apiService.interceptors.request.use(async (config) => {
  try {
    const token = Cookies.get(STORAGE_KEYS.USER_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    await simulateNetworkDelay();

    return config;
  } catch (error) {
    console.error("Error while setting Authorization header:", error);
    throw new Error("Failed to set Authorization header");
  }
});

apiService.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = getErrorMessage(error);

    if (error.response && error.response.status === 403) {
      toast.error("Your not Authorized for this action");
      return Promise.reject(error); 
    }

    if (error.response && error.response.status === 401) {
      console.log("Your session has expired. Please login again.");
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      window.location.href = "/";
    }

    console.log("API request failed:", errorMessage);
    console.log("Full error object:", error);

    const e = error.response?.data || "faild to do this request";
    toast.error(e);

    return Promise.reject(error);
  }
);

export default apiService;
