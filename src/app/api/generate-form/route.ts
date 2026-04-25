import { NextResponse } from "next/server";
import { generateFormSchemaFromPrompt } from "../../../lib/generateFormSchema.server";

type GenerateFormRequest = {
  prompt?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateFormRequest;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Enter a prompt before generating a form." },
        { status: 400 },
      );
    }

    const schema = await generateFormSchemaFromPrompt(prompt);

    return NextResponse.json({ schema });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while generating the form.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
