import type { FormSchema } from "../lib/formSchema";

type SchemaPanelProps = {
  schema: FormSchema | null;
};

export function SchemaPanel({ schema }: SchemaPanelProps) {
  return (
    <aside className="schema-card">
      <div className="section-ribbon">Schema</div>
      <div className="schema-card__header">
        <h2>Schema Viewer</h2>
        <p>See the generated JSON that React is rendering.</p>
      </div>

      <pre className="schema-card__code">
        {schema
          ? JSON.stringify(schema, null, 2)
          : "Generate a form to inspect the runtime schema."}
      </pre>
    </aside>
  );
}
