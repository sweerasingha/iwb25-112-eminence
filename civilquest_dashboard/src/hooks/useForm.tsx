import { useState } from "react";
import { ZodSchema, ZodError } from "zod";

type FieldTypes<T> = {
  [K in keyof T]?: "string" | "number" | "boolean";
};

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  schema: ZodSchema<T>,
  fieldTypes?: FieldTypes<T>
) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const parseValue = (name: keyof T, value: string): any => {
    const type = fieldTypes?.[name];

    switch (type) {
      case "number":
        return value === "" ? "" : Number(value);
      case "boolean":
        return value === "true";
      default:
        return value;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const typedValue = parseValue(name as keyof T, value);

    setFormData((prev) => ({
      ...prev,
      [name]: typedValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = (): boolean => {
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((err: import("zod").ZodIssue) => {
          const path = err.path[0] as keyof T;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  return {
    formData,
    errors,
    handleChange,
    validate,
    setErrors,
    setFormData,
  };
}
