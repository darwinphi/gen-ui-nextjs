"use client";

import { useState } from "react";
import { DynamicForm } from "./DynamicForm";
import { SchemaPanel } from "./SchemaPanel";
import { formSchema, type FormSchema } from "../lib/formSchema";

const DEFAULT_PROMPT = "Create a form with only name and email.";
const QUICK_PROMPTS = [
  "Create a form with only name and email.",
  "Create a feedback form with email, topic, and message.",
  "Create a form with full name, email, and a checkbox for newsletter consent.",
];

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
    <>
      <header className="masthead">
        <div className="masthead__brand">
          <span className="masthead__title">gen-ui-nextjs</span>
        </div>
        <div className="masthead__utility">
          <span
            className={`status-chip ${
              apiConfigured ? "status-chip--success" : "status-chip--warning"
            }`}
          >
            {apiConfigured ? "API connected" : "API key missing"}
          </span>
        </div>
      </header>

      <main className="page-shell">
        <section className="intro-block">
          <p className="section-kicker">LLM-backed generative UI</p>
          <h1 className="intro-block__headline">Describe the form. Generate the UI.</h1>
          <p className="intro-copy">
            Type the fields you want, generate once, then inspect the live form
            and its validated schema side by side.
          </p>
        </section>

        <section className="workspace">
          <div className="composer-card composer-card--primary">
            <div className="composer-card__header">
              <div>
                <p className="section-kicker">Prompt</p>
                <h2>What form should the app create?</h2>
              </div>
              <p>
                Be explicit about fields, labels, or options. Example: “Create a
                form with only name, email, and a country select for Southeast Asia.”
              </p>
            </div>

            <label className="prompt-field prompt-field--featured" htmlFor="prompt">
              <span className="field__label">Type your request</span>
              <textarea
                id="prompt"
                name="prompt"
                rows={5}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Create a form with only name and email."
              />
            </label>

            <div className="quick-prompts" aria-label="Suggested prompts">
              {QUICK_PROMPTS.map((currentPrompt) => (
                <button
                  key={currentPrompt}
                  className="quick-prompt"
                  type="button"
                  onClick={() => setPrompt(currentPrompt)}
                >
                  {currentPrompt}
                </button>
              ))}
            </div>

            <div className="composer-actions">
              <button className="generate-button" onClick={handleGenerate} type="button">
                {isLoading ? "Generating..." : "Generate form"}
              </button>
              <p className="subtle-copy subtle-copy--inline">
                API calls happen only when you click Generate.
              </p>
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
                  <p className="section-kicker">Live preview</p>
                  <h2>No generated form yet</h2>
                  <p>
                    Start with a prompt above. The preview will appear here after
                    generation.
                  </p>
                </div>
              </section>
            )}

            <SchemaPanel schema={schema} />
          </div>
        </section>
      </main>
    </>
  );
}
