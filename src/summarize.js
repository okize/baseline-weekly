import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const MODEL = "gpt-5.6-luna";

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

export async function summarize(raw, client = new OpenAI()) {
  const response = await client.responses.parse({
    model: MODEL,
    max_output_tokens: 16000,
    input: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: JSON.stringify({ web: raw.web, node: raw.node }),
      },
    ],
    text: { format: zodTextFormat(BlurbsSchema, "blurbs") },
  });
  const parsed = response.output_parsed;
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
