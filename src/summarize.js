import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const MODEL = "claude-opus-5";

const BlurbsSchema = z.object({
  intro: z.string(),
  web: z.array(z.object({ id: z.string(), blurb: z.string() })),
  node: z.array(z.object({ version: z.string(), blurb: z.string() })),
});

const SYSTEM = `You write "Baseline Weekly", a short digest of web platform
features that just became Baseline (usable in all major browsers) and new
Node.js releases. The audience is working web developers.

For each item, write a blurb of one to three plain sentences: what it is and
why a developer would care. No hype, no filler. Write an intro of one or two
sentences summarizing the week. If there are no items, say so plainly.
Return one blurb for every input item, keyed by its id or version.`;

export async function summarize(raw, client = new Anthropic()) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{
      role: "user",
      content: JSON.stringify({ web: raw.web, node: raw.node }),
    }],
    output_config: { format: zodOutputFormat(BlurbsSchema) },
  });
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("model returned unparseable output");

  const webBlurbs = new Map(parsed.web.map((b) => [b.id, b.blurb]));
  const nodeBlurbs = new Map(parsed.node.map((b) => [b.version, b.blurb]));
  return {
    date: raw.date,
    curated: true,
    intro: parsed.intro,
    web: raw.web.map((i) => ({ ...i, blurb: webBlurbs.get(i.id) ?? "" })),
    node: raw.node.map((i) => ({ ...i, blurb: nodeBlurbs.get(i.version) ?? "" })),
  };
}

export function uncurated(raw) {
  return {
    date: raw.date,
    curated: false,
    intro: "This week's items, without commentary. (Automatic summarization failed.)",
    web: raw.web.map((i) => ({ ...i, blurb: "" })),
    node: raw.node.map((i) => ({ ...i, blurb: "" })),
  };
}
