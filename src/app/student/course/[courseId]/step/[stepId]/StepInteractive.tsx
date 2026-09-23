"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StepInteractive({
  course,
  currentStep,
  studentId,
  initialSubmission,
}: {
  course: any;
  currentStep: any;
  studentId: string;
  initialSubmission?: any;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(initialSubmission || null);

  const stepsList = course.steps || [];
  const currentIndex = stepsList.findIndex((s: any) => s.id === currentStep.id);
  const prevStep = stepsList[currentIndex - 1];
  const nextStep = stepsList[currentIndex + 1];

  let payload: any = {};
  try {
    payload = typeof currentStep.payloadJson === "string" 
      ? JSON.parse(currentStep.payloadJson) 
      : currentStep.payloadJson || {};
  } catch {
    payload = {};
  }

  const handleSubmit = async (customAnswer?: string) => {
    const finalAnswer = customAnswer !== undefined ? customAnswer : answer;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          stepId: currentStep.id,
          content: finalAnswer,
        }),
      });

      const data = await res.json();
      setResult(data.submission);
      router.refresh();
    } catch (e: any) {
      alert("Ошибка отправки: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      {/* Навигация */}
      <div className="flex items-center justify-between">
        <Link
          href={`/student/course/${course.id}`}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-900 transition flex items-center gap-1.5"
        >
          ← Все шаги курса
        </Link>
        <span className="text-xs font-mono text-zinc-400">
          Шаг {currentIndex + 1} из {stepsList.length}
        </span>
      </div>

      {/* Линейка шагов (Timeline) */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stepsList.map((s: any, idx: number) => (
          <Link
            key={s.id}
            href={`/student/course/${course.id}/step/${s.id}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition whitespace-nowrap ${
              s.id === currentStep.id
                ? "bg-zinc-900 text-white font-bold"
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {idx + 1}. {s.title.slice(0, 18)}...
          </Link>
        ))}
      </div>

      {/* Карточка задания */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="border-b border-zinc-100 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded">
              {currentStep.type}
            </span>
            <h1 className="text-2xl font-semibold text-zinc-950 mt-2">
              {currentStep.title}
            </h1>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-400">
            {currentStep.maxScore} баллов
          </span>
        </div>

        {/* 1. ТЕОРИЯ */}
        {currentStep.type === "THEORY" && (
          <div className="space-y-6">
            <div className="prose text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap bg-zinc-50/60 p-6 rounded-2xl border border-zinc-200/60">
              {payload.text || payload.instructions || "Изучите представленный теоретический материал."}
            </div>
            <button
              onClick={() => handleSubmit("Ознакомлен")}
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs py-3 rounded-xl transition"
            >
              {loading ? "Сохранение..." : "Я изучил материал · Завершить шаг ✓"}
            </button>
          </div>
        )}

        {/* 2. ТЕСТ */}
        {currentStep.type === "QUIZ" && (
          <div className="space-y-5">
            <div className="text-sm font-medium text-zinc-900">
              {payload.question || "Выберите верный вариант:"}
            </div>
            <div className="space-y-2">
              {(payload.options || ["Вариант 1", "Вариант 2"]).map(
                (opt: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAnswer(String(idx))}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition ${
                      answer === String(idx)
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || answer === ""}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition"
            >
              {loading ? "Проверка..." : "Ответить на вопрос"}
            </button>
          </div>
        )}

        {/* 3. КОД С АВТОТЕСТАМИ */}
        {currentStep.type === "CODE" && (
          <div className="space-y-4">
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-xs text-zinc-700 space-y-2">
              <div className="font-semibold text-zinc-900">Условие олимпиадной задачи:</div>
              <p>{payload.task || "Напишите программу решения задачи."}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Код решения:
              </label>
              <textarea
                rows={8}
                value={answer || payload.starterCode || ""}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="function solve(input) { ... }"
                className="w-full font-mono text-xs border border-zinc-200 rounded-2xl p-4 focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-zinc-950 text-emerald-400"
              />
            </div>

            <button
              onClick={() => handleSubmit(answer || payload.starterCode)}
              disabled={loading}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition"
            >
              {loading ? "Запуск тестов..." : "Запустить и проверить код ▶"}
            </button>
          </div>
        )}

        {/* 4. SCRATCH И MINECRAFT */}
        {(currentStep.type === "SCRATCH" || currentStep.type === "MINECRAFT") && (
          <div className="space-y-5">
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 text-xs text-zinc-700 space-y-2">
              <div className="font-semibold text-zinc-900">
                Задание в среде {currentStep.type === "SCRATCH" ? "Scratch" : "Minecraft Education"}:
              </div>
              <p className="leading-relaxed">
                {payload.task || "Соберите проект по инструкции и пришлите ссылку на проверку."}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Ссылка на проект / результат работы:
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={
                  currentStep.type === "SCRATCH"
                    ? "https://scratch.mit.edu/projects/..."
                    : "Ссылка на скриншот или мир Minecraft"
                }
                className="w-full text-xs border border-zinc-200 rounded-xl p-3 focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-zinc-50/50 font-mono"
              />
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={loading || !answer.trim()}
              className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition"
            >
              {loading ? "Отправка..." : "Отправить куратору на проверку →"}
            </button>
          </div>
        )}

        {/* Результат проверки */}
        {result && (
          <div
            className={`p-4 rounded-2xl border text-xs transition-all ${
              result.status === "ACCEPTED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : result.status === "REJECTED"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>
                {result.status === "ACCEPTED"
                  ? "✓ Задание зачтено!"
                  : result.status === "REJECTED"
                  ? "✕ Доработка"
                  : "⏳ Направлено куратору в очередь"}
              </span>
              <span className="font-mono font-bold">+{result.score} б.</span>
            </div>
            {result.feedback && (
              <pre className="mt-2 text-[11px] whitespace-pre-wrap font-sans">
                {result.feedback}
              </pre>
            )}
          </div>
        )}

        {/* Навигация «Назад / Вперед» */}
        <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
          {prevStep ? (
            <Link
              href={`/student/course/${course.id}/step/${prevStep.id}`}
              className="text-xs text-zinc-500 hover:text-zinc-900 transition"
            >
              ← Предыдущий шаг
            </Link>
          ) : (
            <div />
          )}

          {nextStep ? (
            <Link
              href={`/student/course/${course.id}/step/${nextStep.id}`}
              className="text-xs font-semibold text-zinc-900 hover:text-blue-600 transition"
            >
              Следующий шаг →
            </Link>
          ) : (
            <Link
              href={`/student/course/${course.id}`}
              className="text-xs font-semibold text-emerald-600"
            >
              Курс завершен ✓
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}