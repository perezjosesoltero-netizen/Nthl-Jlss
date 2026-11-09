"use client";

import { useState } from "react";

export default function Home() {
  const [lessonText, setLessonText] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonText, question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Hubo un error");
      }

      setResult(data);
    } catch (error) {
      setResult({
        answer: "No pude responder esa pregunta.",
        explanation: error.message,
        key_points: [],
        confidence: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <h1>Nthl Jlss</h1>
        <p className="subtitle">
          Responde preguntas usando el contenido de la lección como contexto.
        </p>

        <form onSubmit={handleSubmit} className="panel">
          <label>
            Material de la lección
            <textarea
              value={lessonText}
              onChange={(event) => setLessonText(event.target.value)}
              placeholder="Pega aquí el contenido de la lección o el texto de estudio..."
              rows={12}
            />
          </label>

          <label>
            Pregunta
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Escribe tu pregunta..."
              rows={4}
            />
          </label>

          <button type="submit" disabled={loading || !lessonText || !question}>
            {loading ? "Respondiendo..." : "Responder"}
          </button>
        </form>

        {result && (
          <section className="result">
            <h2>Respuesta</h2>
            <p>{result.answer}</p>

            <h3>Explicación</h3>
            <p>{result.explanation}</p>

            <h3>Puntos clave</h3>
            <ul>
              {result.key_points && result.key_points.length > 0 ? (
                result.key_points.map((point, index) => <li key={index}>{point}</li>)
              ) : (
                <li>No hay puntos clave disponibles.</li>
              )}
            </ul>

            <div className="confidence">
              Confianza: {(result.confidence * 100).toFixed(0)}%
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
