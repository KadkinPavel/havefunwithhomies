"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MinimalStepPlayer({
  params,
}: {
  params: { courseId: string; stepId: string };
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const studentId = "student_ivan";

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, stepId: params.stepId, content }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data.submission);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      {/* Навигационный хлебный крошек */}
      <button
        onClick={() => router.push("/student")}
        className="text-xs font-medium text-zinc-400 hover:text-zinc-800 transition flex items-center gap-1.5"
      >
        ← Назад к списку курсов
      </button>

      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <span className="text-xs font-mono font-medium px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md">
            Интерактивный шаг курса
          </span>
          <span className="text-xs text-zinc-400 font-mono">Step ID: {params.stepId.slice(-6)}</span>
        </div>

        {/* Памятка по типам */}
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-4 text-xs text-zinc-600 space-y-1 leading-relaxed">
          <div className="font-semibold text-zinc-900 mb-1">Формат отправки ответа:</div>
          <div>• <strong>Алгоритмика (Код):</strong> введите код решения задачи.</div>
          <div>• <strong>Scratch / Minecraft:</strong> вставьте ссылку на проект или скриншот.</div>
          <div>• <strong>Тест:</strong> укажите порядковый номер ответа (начиная с 0).</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 block">Ваше решение:</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Вставьте исходный код программы или ссылку на проект..."
            className="w-full font-mono text-xs border border-zinc-200 rounded-2xl p-4 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition bg-zinc-50/50"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-400">
            {content.length > 0 ? `${content.length} симв.` : "Поле ответа не заполнено"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs px-6 py-3 rounded-xl transition shadow-sm"
          >
            {loading ? "Выполняется проверка..." : "Отправить на проверку"}
          </button>
        </div>

        {/* Результат проверки */}
        {result && (
          <div
            className={`p-5 rounded-2xl border text-xs transition-all ${
              result.status === "ACCEPTED"
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : result.status === "REJECTED"
                ? "bg-rose-50/80 border-rose-200 text-rose-900"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>
                {result.status === "ACCEPTED"
                  ? "✓ Задание зачтено!"
                  : result.status === "REJECTED"
                  ? "✕ Требуются исправления"
                  : "⏳ Работа направлена куратору"}
              </span>
              <span className="font-mono font-bold">+{result.score} б.</span>
            </div>
            {result.feedback && (
              <div className="mt-3 pt-3 border-t border-current/15 whitespace-pre-wrap font-mono">
                {result.feedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}