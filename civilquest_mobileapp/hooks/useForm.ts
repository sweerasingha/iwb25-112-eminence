import { useState, useCallback } from "react";
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
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const parseValue = useCallback(
    (name: keyof T, value: string): any => {
      const type = fieldTypes?.[name];

      switch (type) {
        case "number":
          return value === "" ? "" : Number(value);
        case "boolean":
          return value === "true";
        default:
          return value;
      }
    },
    [fieldTypes]
  );

  const handleChange = useCallback(
    (name: keyof T, value: string) => {
      const typedValue = parseValue(name, value);

      setFormData((prev) => ({
        ...prev,
        [name]: typedValue,
      }));

      // Clear error when user starts typing
      setErrors((prev) => {
        if (prev[name]) {
          return {
            ...prev,
            [name]: "",
          };
        }
        return prev;
      });
    },
    [parseValue]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate single field on blur
      try {
        schema.parse(formData);
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.issues.find(
            (issue) => issue.path[0] === name
          );
          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [name]: fieldError.message,
            }));
          }
        }
      }
    },
    [formData, schema]
  );

  const validate = useCallback((): boolean => {
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((err) => {
          const path = err.path[0] as keyof T;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);

        // Mark all fields with errors as touched
        const touchedFields: Partial<Record<keyof T, boolean>> = {};
        Object.keys(fieldErrors).forEach((key) => {
          touchedFields[key as keyof T] = true;
        });
        setTouched((prev) => ({ ...prev, ...touchedFields }));
      }
      return false;
    }
  }, [formData, schema]);

  const reset = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: formData[name]?.toString() || "",
      onChangeText: (value: string) => handleChange(name, value),
      onBlur: () => handleBlur(name),
      error: touched[name] ? errors[name] : undefined,
    }),
    [formData, touched, errors, handleChange, handleBlur]
  );

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setErrors,
    setFormData,
    setFieldValue,
    setFieldError,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    isDirty: JSON.stringify(formData) !== JSON.stringify(initialValues),
  };
}
