import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { lessonText, question } = await request.json();

    if (!lessonText || !question) {
      return Response.json(
        { error: "Faltan el contenido de la lección o la pregunta." },
        { status: 400 }
      );
    }

    const systemPrompt = `
      Eres un tutor educativo experto.
      Responde usando únicamente el material de la lección que el usuario proporciona.
      Si la información no aparece en el contenido, dilo claramente.
      No inventes hechos ni citas.
      Responde en español.
      Devuelve un JSON válido con esta estructura:
      {
        "answer": "respuesta directa",
        "explanation": "explicación breve y clara",
        "key_points": ["punto 1", "punto 2", "punto 3"],
        "confidence": 0.0
      }
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
            Lección:
            ${lessonText}

            Pregunta:
            ${question}
          `,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    let payload = {};

    try {
      payload = JSON.parse(content);
    } catch {
      payload = {
        answer: content,
        explanation: "No se pudo parsear el JSON, pero se respondió usando el contexto disponible.",
        key_points: [],
        confidence: 0.5,
      };
    }

    return Response.json({
      answer: payload.answer || "No encontré una respuesta clara en el contenido.",
      explanation:
        payload.explanation ||
        "La respuesta se basó en el material de la lección proporcionado.",
      key_points: Array.isArray(payload.key_points) ? payload.key_points : [],
      confidence: typeof payload.confidence === "number" ? payload.confidence : 0.8,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Hubo un problema al responder la pregunta.",
      },
      { status: 500 }
    );
  }
}
