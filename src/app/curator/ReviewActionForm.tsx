"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewActionForm({
  submissionId,
  maxScore,
}: {
  submissionId: string;
  maxScore: number;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(maxScore);
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    setSubmitting(true);
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId,
        status,
        score: status === "ACCEPTED" ? score : 0,
        feedback: feedback || (status === "ACCEPTED" ? "Работа зачтена отлично!" : "Требуются исправления."),
      }),
    });
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="pt-4 border-t border-zinc-100 space-y-3">
      <input
        type="text"
        placeholder="Оставьте конструктивный комментарий для школьника..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50 transition"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500 font-mono">Оценка:</label>
          <input
            type="number"
            min={0}
            max={maxScore}
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value, 10))}
            className="w-16 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-center"
          />
          <span className="text-xs text-zinc-400 font-mono">/ {maxScore}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleAction("REJECTED")}
            disabled={submitting}
            className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium px-4 py-2 rounded-xl transition"
          >
            Вернуть с правками
          </button>
          <button
            onClick={() => handleAction("ACCEPTED")}
            disabled={submitting}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded-xl transition shadow-sm"
          >
            Принять проект
          </button>
        </div>
      </div>
    </div>
  );
}