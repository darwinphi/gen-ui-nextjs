"use client";

import { useState } from "react";
import { DynamicForm } from "./DynamicForm";
import { SchemaPanel } from "./SchemaPanel";
import { formSchema, type FormSchema } from "../lib/formSchema";

const DEFAULT_PROMPT = "Create a form with only name and email.";

type GenerateFormResponse = {
  schema?: unknown;
  error?: string;
};

type FormBuilderWorkbenchProps = {
  apiConfigured?: boolean;
};

export function FormBuilderWorkbench({
  apiConfigured = false,
}: FormBuilderWorkbenchProps) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as GenerateFormResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "The server could not generate a form.");
      }

      const nextSchema = formSchema.parse(data.schema);
      setSchema(nextSchema);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the form.";

      setSchema(null);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__eyebrow">LLM-Backed Generative UI</div>
        <h1>Next.js form generation with a server-side model</h1>
        <p>
          The prompt is sent to a Next.js route handler, the model returns a
          strict schema, and React renders only the allowed field components.
        </p>
      </section>

      <section className="workspace">
        <div className="composer-card">
          <div className="composer-card__header">
            <h2>Prompt</h2>
            <p>
              Try prompts like “only name and email”, “feedback form with topic
              and message”, or “job application with cover letter”.
            </p>
          </div>

          <label className="prompt-field" htmlFor="prompt">
            <span className="field__label">Describe the form you want to generate</span>
            <textarea
              id="prompt"
              name="prompt"
              rows={5}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </label>

          <div className="status-row">
            <button className="generate-button" onClick={handleGenerate} type="button">
              {isLoading ? "Generating..." : "Generate form"}
            </button>
            <span
              className={`status-chip ${
                apiConfigured ? "status-chip--success" : "status-chip--warning"
              }`}
            >
              {apiConfigured ? "API connected" : "API key missing"}
            </span>
            <span className="status-chip">Server route: /api/generate-form</span>
            <span className="status-chip">Model output is schema-validated</span>
          </div>

          <p className="subtle-copy">
            Set <code>OPENAI_API_KEY</code> and <code>OPENAI_MODEL</code> in{" "}
            <code>.env.local</code> before running the app.
          </p>

          {errorMessage ? (
            <div aria-live="assertive" className="error-banner" role="alert">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="panel-grid">
          {schema ? (
            <DynamicForm schema={schema} />
          ) : (
            <section className="empty-state">
              <div>
                <h2>No generated form yet</h2>
                <p>Generate a prompt above to render a runtime-built UI.</p>
              </div>
            </section>
          )}

          <SchemaPanel schema={schema} />
        </div>
      </section>
    </main>
  );
}
