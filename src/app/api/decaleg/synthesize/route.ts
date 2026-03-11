import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const { submissions, marcContext } = await req.json() as {
    submissions: { principle_1: string; principle_2: string; principle_3: string }[];
    marcContext: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  const allPrinciples = submissions.flatMap(s => [s.principle_1, s.principle_2, s.principle_3]);
  const principleList = allPrinciples.map((p, i) => `${i + 1}. ${p}`).join("\n");

  const prompt = `Ets un expert en educació i integració pedagògica de la Intel·ligència Artificial.

A continuació tens les aportacions de ${submissions.length} docents que han escrit els seus principis sobre l'ús de la IA a l'educació:

${principleList}

Context institucional (fragments del Marc General d'Integració de la IA):
${marcContext.slice(0, 3000)}

La teva tasca:
1. Analitza les aportacions, troba les idees recurrents i les tensions
2. Redacta un DECÀLEG de 10 orientacions que:
   - Integri les veus dels docents (usa el seu vocabulari, no ho parafrasiïs tot)
   - Sigui coherent amb el marc institucional
   - Estigui en català, en llenguatge planer i accessible (comprensible per a alumnat i famílies), però formal i seriós
   - Cada orientació: títol curt en negreta + 1-2 frases explicatives
   - Evita tecnicismes innecessaris

Respon ÚNICAMENT amb un JSON en aquest format exacte, sense cap text addicional:
{
  "orientations": [
    { "n": 1, "title": "Títol curt", "text": "Explicació d'1-2 frases." },
    ...10 items...
  ],
  "summary": "Una frase que resumeixi el consens dels docents."
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Synthesis error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
