"use client";

import { useState } from "react";

export default function PredictionForm() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/sentimen/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      setResult(data.label);
    } catch (error) {
      console.error("Prediction failed", error);
      setResult("Gagal memprediksi.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border p-2 mb-2"
          placeholder="Masukkan kalimat..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2" type="submit">
          Prediksi
        </button>
      </form>
      {result && (
        <div className="mt-4 p-2 bg-gray-100">
          <strong>Hasil Klasifikasi:</strong> {result}
        </div>
      )}
    </div>
  );
}
