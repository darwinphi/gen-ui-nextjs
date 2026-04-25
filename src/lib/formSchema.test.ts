import { describe, expect, it } from "vitest";
import { formSchema, stripNulls } from "./formSchema";

describe("formSchema", () => {
  it("accepts a simple name and email form", () => {
    const result = formSchema.parse({
      title: "Simple Contact Form",
      submitLabel: "Send",
      fields: [
        { type: "text", name: "name", label: "Name", required: true },
        { type: "email", name: "email", label: "Email", required: true },
      ],
    });

    expect(result.fields).toHaveLength(2);
  });

  it("rejects select fields without options", () => {
    expect(() =>
      formSchema.parse({
        title: "Broken Form",
        submitLabel: "Send",
        fields: [{ type: "select", name: "role", label: "Role" }],
      }),
    ).toThrow();
  });

  it("removes nullable structured-output keys before validation", () => {
    const normalized = stripNulls({
      title: "Simple Contact Form",
      description: null,
      submitLabel: "Send",
      fields: [
        {
          type: "text",
          name: "name",
          label: "Name",
          required: true,
          placeholder: null,
          options: null,
          defaultValue: null,
        },
      ],
    });

    expect(formSchema.parse(normalized).fields[0].type).toBe("text");
  });
});
