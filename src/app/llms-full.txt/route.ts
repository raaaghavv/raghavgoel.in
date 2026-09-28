import { llmsFullTxt } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
