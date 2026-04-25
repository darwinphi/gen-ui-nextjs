import OpenAI from "openai";
import { FORM_SCHEMA_JSON_SCHEMA, formSchema, stripNulls, type FormSchema } from "./formSchema";

const SCHEMA_INSTRUCTIONS = `You convert product requests into safe form schemas for a React UI renderer.

Return only JSON that matches the provided schema.

Rules:
- Include only fields the user explicitly asks for.
- Do not add extra fields just because they are common in signup or contact forms.
- Use these field types only: text, email, select, checkbox, textarea.
- Use email only for email addresses.
- Use select only when the user clearly implies a fixed choice list.
- For select fields, include useful options.
- Use checkbox for yes/no consent style fields.
- If the request is vague or does not mention any fields, return a minimal contact form with name, email, and message.
- Keep titles short and human-readable.
- Keep submitLabel specific to the form intent.
- Never include unsupported UI widgets, layout metadata, or validation rules outside the schema.`;

export async function generateFormSchemaFromPrompt(prompt: string): Promise<FormSchema> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY in .env.local before generating forms.");
  }

  if (!model) {
    throw new Error("Set OPENAI_MODEL in .env.local before generating forms.");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    instructions: SCHEMA_INSTRUCTIONS,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "generated_form_schema",
        strict: true,
        schema: FORM_SCHEMA_JSON_SCHEMA,
      },
    },
  });

  const rawOutput = response.output_text;

  if (!rawOutput) {
    throw new Error("The model returned an empty response.");
  }

  const parsedOutput = JSON.parse(rawOutput) as unknown;
  return formSchema.parse(stripNulls(parsedOutput));
}
