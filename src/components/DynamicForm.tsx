"use client";

import { useEffect, useState, type ReactNode } from "react";
import { buildInitialValues, validateForm, type FormErrors, type FormValues } from "../lib/formState";
import type { FieldSchema, FormSchema } from "../lib/formSchema";

type DynamicFormProps = {
  schema: FormSchema;
};

type FieldRendererProps = {
  field: FieldSchema;
  value: string | boolean;
  error?: string;
  onChange: (name: string, value: string | boolean) => void;
};

function FieldShell({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="field" htmlFor={htmlFor}>
      <span className="field__label">{label}</span>
      {children}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}

const fieldRegistry: Record<FieldSchema["type"], (props: FieldRendererProps) => ReactNode> = {
  text: ({ field, value, error, onChange }) => (
    <FieldShell label={field.label} error={error} htmlFor={field.name}>
      <input
        id={field.name}
        name={field.name}
        type="text"
        value={String(value)}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </FieldShell>
  ),
  email: ({ field, value, error, onChange }) => (
    <FieldShell label={field.label} error={error} htmlFor={field.name}>
      <input
        id={field.name}
        name={field.name}
        type="email"
        value={String(value)}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </FieldShell>
  ),
  textarea: ({ field, value, error, onChange }) => (
    <FieldShell label={field.label} error={error} htmlFor={field.name}>
      <textarea
        id={field.name}
        name={field.name}
        value={String(value)}
        placeholder={field.placeholder}
        rows={5}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    </FieldShell>
  ),
  select: ({ field, value, error, onChange }) => (
    field.type === "select" ? (
      <FieldShell label={field.label} error={error} htmlFor={field.name}>
        <select
          id={field.name}
          name={field.name}
          value={String(value)}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          <option value="">Select an option</option>
          {field.options.map((currentOption) => (
            <option key={currentOption.value} value={currentOption.value}>
              {currentOption.label}
            </option>
          ))}
        </select>
      </FieldShell>
    ) : null
  ),
  checkbox: ({ field, value, error, onChange }) => (
    <label className="checkbox-field" htmlFor={field.name}>
      <span className="checkbox-field__control">
        <input
          id={field.name}
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
        />
        <span>{field.label}</span>
      </span>
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  ),
};

export function DynamicForm({ schema }: DynamicFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(schema));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedValues, setSubmittedValues] = useState<FormValues | null>(null);

  useEffect(() => {
    setValues(buildInitialValues(schema));
    setErrors({});
    setSubmittedValues(null);
  }, [schema]);

  function handleFieldChange(name: string, value: string | boolean) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => {
      if (!(name in currentErrors)) {
        return currentErrors;
      }

      const { [name]: _, ...rest } = currentErrors;
      return rest;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(schema, values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmittedValues(null);
      return;
    }

    setErrors({});
    setSubmittedValues(values);
  }

  return (
    <div className="preview-card">
      <div className="section-ribbon">Live Preview</div>
      <div className="preview-card__header">
        <h2>{schema.title}</h2>
        {schema.description ? <p>{schema.description}</p> : null}
      </div>

      <form className="dynamic-form" onSubmit={handleSubmit}>
        {schema.fields.map((currentField) => (
          <div key={currentField.name}>
            {fieldRegistry[currentField.type]({
              field: currentField,
              value: values[currentField.name],
              error: errors[currentField.name],
              onChange: handleFieldChange,
            })}
          </div>
        ))}

        <button className="submit-button" type="submit">
          {schema.submitLabel}
        </button>
      </form>

      {submittedValues ? (
        <div aria-live="polite" className="result-card">
          <h3>Submitted Values</h3>
          <pre>{JSON.stringify(submittedValues, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
