import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormBuilderWorkbench } from "./FormBuilderWorkbench";

const originalFetch = global.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
});

describe("FormBuilderWorkbench", () => {
  it("shows connected status when the API key is configured", () => {
    render(<FormBuilderWorkbench apiConfigured />);

    expect(screen.getByText("API connected")).toBeInTheDocument();
  });

  it("renders only the fields returned by the server schema", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        schema: {
          title: "Simple Contact Form",
          description: "Only the requested fields.",
          submitLabel: "Send",
          fields: [
            { type: "text", name: "name", label: "Name", required: true },
            { type: "email", name: "email", label: "Email", required: true },
          ],
        },
      }),
    }) as typeof fetch;

    render(<FormBuilderWorkbench apiConfigured />);

    await userEvent.click(screen.getByRole("button", { name: /generate form/i }));

    expect(
      await screen.findByRole("heading", { name: "Simple Contact Form" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.queryByLabelText("Role")).not.toBeInTheDocument();
  });

  it("shows form validation errors from the rendered schema", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        schema: {
          title: "Feedback",
          submitLabel: "Submit",
          fields: [
            { type: "email", name: "email", label: "Email", required: true },
            { type: "textarea", name: "message", label: "Message", required: true },
          ],
        },
      }),
    }) as typeof fetch;

    render(<FormBuilderWorkbench apiConfigured />);

    await userEvent.click(screen.getByRole("button", { name: /generate form/i }));
    expect(await screen.findByRole("heading", { name: "Feedback" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getAllByText("This field is required.")).toHaveLength(2);
  });

  it("shows a friendly error when the route fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Set OPENAI_MODEL in .env.local before generating forms.",
      }),
    }) as typeof fetch;

    render(<FormBuilderWorkbench />);

    await userEvent.click(screen.getByRole("button", { name: /generate form/i }));

    expect(
      await screen.findByText("Set OPENAI_MODEL in .env.local before generating forms."),
    ).toBeInTheDocument();
  });

  it("shows a friendly error when the server returns malformed schema", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        schema: {
          title: "Broken Form",
          submitLabel: "Submit",
          fields: "not-an-array",
        },
      }),
    }) as typeof fetch;

    render(<FormBuilderWorkbench apiConfigured />);

    await userEvent.click(screen.getByRole("button", { name: /generate form/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
