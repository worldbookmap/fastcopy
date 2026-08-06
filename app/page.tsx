import { HomePage } from "@/components/home-page";
import { getSnippets } from "@/lib/snippets";

export default async function Page() {
  const snippets = await getSnippets();

  return <HomePage initialSnippets={snippets} />;
}