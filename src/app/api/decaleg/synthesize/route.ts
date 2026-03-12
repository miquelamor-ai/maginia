import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const { submissions, refinements, currentDecaleg, marcContext } = await req.json() as {
    submissions: { principle_1: string; principle_2: string; principle_3: string }[];
    refinements?: { text: string }[];
    currentDecaleg?: { orientations: { n: number; title: string; text: string }[]; summary: string };
    marcContext: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  const allPrinciples = submissions.flatMap(s => [s.principle_1, s.principle_2, s.principle_3]);
  const principleList = allPrinciples.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const refinementsList = (refinements || []).map((r, i) => `${i + 1}. ${r.text}`).join("\n");
  const currentDecalegText = currentDecaleg 
    ? currentDecaleg.orientations.map(o => `${o.n}. **${o.title}**: ${o.text}`).join("\n")
    : "Cap decàleg previ.";

  const prompt = `Ets un expert en educació i integració pedagògica de la Intel·ligència Artificial.
  
Context institucional (fragments del Marc General d'Integració de la IA):
${marcContext.slice(0, 2000)}

A continuació tens les aportacions de ${submissions.length} docents que han escrit els seus principis originals:
${principleList}

DECÀLEG VIGENT FINS ARA:
${currentDecalegText}

NOVES APORTACIONS DE REFINAMENT (Matisos, dubtes o desacords que s'han d'integrar):
${refinementsList || "Cap nova aportació encara."}

La teva tasca:
1. Analitza les noves aportacions de REFINAMENT respecte al DECÀLEG VIGENT.
2. Si les aportacions afegeixen matisos importants, actualitza les orientacions del decàleg.
3. Si detectes DESACORDS o TENSIONS entre el que diuen els docents o amb el marc institucional, assenyala-ho.
4. Redacta el NOU DECÀLEG de 10 orientacions que:
   - Integri les veus dels docents (usa el seu vocabulari).
   - Sigui coherent amb el marc institucional.
   - S'expressi en català planer i accessible (comprensible per a alumnat i famílies), però formal i seriós.
5. Per cada orientació: títol curt en negreta + 1-2 frases explicatives.
6. AFEGEIX un camp "tension" (string) si aquella orientació és polèmica o té punts de fricció no resolts. Si hi ha consens, deixa'l buit.

Respon ÚNICAMENT amb un JSON en aquest format exacte:
{
  "orientations": [
    { "n": 1, "title": "Títol", "text": "...", "tension": "Opcional: descriu breument el punt de tensió detectat" },
    ... 10 items ...
  ],
  "summary": "Resum del consens actualitzat.",
  "detectedTensions": ["Llista opcional de temes en desacord si n'hi ha"]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    if (message.stop_reason === "max_tokens") {
      throw new Error("Resposta tallada: el decàleg és massa llarg. Redueix les aportacions o el context.");
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as {status?: number})?.status;
    console.error("Synthesis error:", msg, "status:", status, err);
    return NextResponse.json({ error: msg, status }, { status: 500 });
  }
}
