"use client";
import LoadingButton from "@/components/ui/button";
import { InputField } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import { ApiResponse } from "@/types";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import z from "zod";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const useAuthHook = useAuth();
  const router = useRouter();

  const { formData, handleChange, errors, validate } = useForm<LoginFormData>(
    { email: "", password: "" },
    LoginSchema
  );

  const handleLogin = async () => {
    if (validate()) {
      const data = {
        email: formData.email,
        password: formData.password,
      };
      const response: ApiResponse = await useAuthHook.login(data);
      if (response.status) {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <InputField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <InputField
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <LoadingButton
              onClick={handleLogin}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-3 rounded-md text-white font-medium transition
                bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Sign In
            </LoadingButton>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Forgot your password?{" "}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                onClick={() =>
                  toast.info("Password reset functionality coming soon")
                }
              >
                Reset it here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
