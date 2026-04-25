import { z } from "zod";

export const fieldOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const baseFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

const textLikeFieldSchema = baseFieldSchema.extend({
  type: z.enum(["text", "email", "textarea"]),
  defaultValue: z.string().optional(),
});

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal("select"),
  options: z.array(fieldOptionSchema).min(1),
  defaultValue: z.string().optional(),
});

const checkboxFieldSchema = baseFieldSchema.extend({
  type: z.literal("checkbox"),
  defaultValue: z.boolean().optional(),
});

export const fieldSchema = z.discriminatedUnion("type", [
  textLikeFieldSchema,
  selectFieldSchema,
  checkboxFieldSchema,
]);

export const formSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  submitLabel: z.string().min(1),
  fields: z.array(fieldSchema).min(1),
});

const nullableStringSchema = {
  anyOf: [{ type: "string", minLength: 1 }, { type: "null" }],
} as const;

const nullableBooleanSchema = {
  anyOf: [{ type: "boolean" }, { type: "null" }],
} as const;

const fieldOptionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: {
      type: "string",
      minLength: 1,
    },
    value: {
      type: "string",
      minLength: 1,
    },
  },
  required: ["label", "value"],
} as const;

const textLikeFieldJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: ["text", "email", "textarea"],
    },
    name: {
      type: "string",
      minLength: 1,
    },
    label: {
      type: "string",
      minLength: 1,
    },
    required: nullableBooleanSchema,
    placeholder: nullableStringSchema,
    options: {
      type: "null",
    },
    defaultValue: nullableStringSchema,
  },
  required: ["type", "name", "label", "required", "placeholder", "options", "defaultValue"],
} as const;

const selectFieldJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: ["select"],
    },
    name: {
      type: "string",
      minLength: 1,
    },
    label: {
      type: "string",
      minLength: 1,
    },
    required: nullableBooleanSchema,
    placeholder: nullableStringSchema,
    options: {
      type: "array",
      minItems: 1,
      items: fieldOptionJsonSchema,
    },
    defaultValue: nullableStringSchema,
  },
  required: ["type", "name", "label", "required", "placeholder", "options", "defaultValue"],
} as const;

const checkboxFieldJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      enum: ["checkbox"],
    },
    name: {
      type: "string",
      minLength: 1,
    },
    label: {
      type: "string",
      minLength: 1,
    },
    required: nullableBooleanSchema,
    placeholder: {
      type: "null",
    },
    options: {
      type: "null",
    },
    defaultValue: nullableBooleanSchema,
  },
  required: ["type", "name", "label", "required", "placeholder", "options", "defaultValue"],
} as const;

export const FORM_SCHEMA_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      minLength: 1,
    },
    description: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
    submitLabel: {
      type: "string",
      minLength: 1,
    },
    fields: {
      type: "array",
      minItems: 1,
      items: {
        anyOf: [
          textLikeFieldJsonSchema,
          selectFieldJsonSchema,
          checkboxFieldJsonSchema,
        ],
      },
    },
  },
  required: ["title", "description", "submitLabel", "fields"],
} as const;

export function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripNulls(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, currentValue]) => currentValue !== null)
        .map(([key, currentValue]) => [key, stripNulls(currentValue)]),
    ) as T;
  }

  return value;
}

export type FieldOption = z.infer<typeof fieldOptionSchema>;
export type FieldSchema = z.infer<typeof fieldSchema>;
export type FormSchema = z.infer<typeof formSchema>;
