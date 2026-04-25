import { FormBuilderWorkbench } from "../components/FormBuilderWorkbench";

export default function HomePage() {
  return (
    <FormBuilderWorkbench
      apiConfigured={Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL)}
    />
  );
}
