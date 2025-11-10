import type { SelectChangeEvent } from "@mui/material";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ZodType, ZodError } from "zod";

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  requiredFields: (keyof T)[] = [],
  schema?: ZodType<T>
) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const validateZod = useCallback((data: T) => {
    if (!schemaRef.current) return {};
   
    try {
      schemaRef.current.parse(data);
      return {};
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        err.issues.forEach(issue => {
          const key = issue.path[0] as keyof T;
          fieldErrors[key] = issue.message;
        });
        return fieldErrors;
      }
    }
    return {};
  }, []);

  useEffect(() => {
    const newErrors = validateZod(formData);
    setErrors(newErrors);
  }, [formData, validateZod]);

  const isValid = useMemo(() => {
    const requiredFilled = requiredFields.every(
      field =>
        formData[field] !== null &&
        formData[field] !== undefined &&
        String(formData[field]).trim() !== ""
    );
   
    const noErrors = Object.keys(errors).length === 0;
   
    return requiredFilled && noErrors;
  }, [formData, errors, requiredFields]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData(prev => ({ ...prev, [name]: value as T[keyof T] }));
  }, []);

  const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  }, []);

  const setDefault = useCallback(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    formData,
    setFormData,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    errors,
    isValid,
    setDefault,
  };
}