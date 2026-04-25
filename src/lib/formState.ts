import type { FieldSchema, FormSchema } from "./formSchema";

export type FormValues = Record<string, string | boolean>;
export type FormErrors = Record<string, string>;

export function buildInitialValues(schema: FormSchema): FormValues {
  return schema.fields.reduce<FormValues>((accumulator, currentField) => {
    if (currentField.type === "checkbox") {
      accumulator[currentField.name] = Boolean(currentField.defaultValue);
      return accumulator;
    }

    accumulator[currentField.name] =
      typeof currentField.defaultValue === "string" ? currentField.defaultValue : "";
    return accumulator;
  }, {});
}

function validateField(field: FieldSchema, value: string | boolean): string | undefined {
  if (field.type === "checkbox") {
    if (field.required && value !== true) {
      return "This checkbox must be selected.";
    }

    return undefined;
  }

  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (field.required && normalizedValue.length === 0) {
    return "This field is required.";
  }

  if (
    field.type === "email" &&
    normalizedValue.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)
  ) {
    return "Enter a valid email address.";
  }

  return undefined;
}

export function validateForm(schema: FormSchema, values: FormValues): FormErrors {
  return schema.fields.reduce<FormErrors>((accumulator, currentField) => {
    const error = validateField(currentField, values[currentField.name]);

    if (error) {
      accumulator[currentField.name] = error;
    }

    return accumulator;
  }, {});
}
