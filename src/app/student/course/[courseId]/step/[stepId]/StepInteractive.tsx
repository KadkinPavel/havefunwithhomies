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
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6 role-student">
      <Link
        href={`/student?studentId=${studentId}&courseId=${course.id}`}
        className="text-xs font-medium text-brand-ink-3 hover:text-brand-ink transition"
      >
        ← Вернуться к карте курса
      </Link>

      <div className="bg-white border border-brand-line rounded-card p-8 shadow-sm space-y-6">
        <div className="border-b border-brand-line pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 bg-brand-blue-50 text-brand-blue rounded">
              {currentStep.type}
            </span>
            <h1 className="text-xl font-bold text-brand-ink mt-2">
              {currentStep.title}
            </h1>
          </div>
          <span className="text-xs font-mono font-bold text-brand-ink-3">
            +{currentStep.maxScore} баллов
          </span>
        </div>

        {/* ТЕОРИЯ */}
        {currentStep.type === "THEORY" && (
          <div className="space-y-6">
            <div className="text-sm text-brand-ink leading-relaxed whitespace-pre-wrap bg-brand-mist p-6 rounded-card border border-brand-line">
              {payload.text || "Изучите материал шага."}
            </div>
            <button
              onClick={() => handleSubmit("Ознакомлен")}
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs py-3.5 rounded-btn transition shadow-md"
            >
              {loading ? "Сохранение..." : "Я изучил материал · Завершить шаг ✓"}
            </button>
          </div>
        )}

        {/* ТЕСТ (Контрольный вопрос) */}
        {currentStep.type === "QUIZ" && (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-brand-ink">
              {payload.question || "Выберите верный вариант ответа:"}
            </div>

            {/* Если вопрос числовой */}
            {payload.correctNumeric !== undefined ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Введите числовой ответ..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-3 bg-brand-mist/50 font-mono"
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={loading || !answer.trim()}
                  className="bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-40 text-white font-bold text-xs px-6 py-2.5 rounded-btn transition"
                >
                  {loading ? "Проверка..." : "Ответить на вопрос"}
                </button>
              </div>
            ) : (
              /* Если вопрос с вариантами ответа */
              <div className="space-y-2">
                {(payload.options || ["Вариант 1", "Вариант 2"]).map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAnswer(String(idx));
                      handleSubmit(String(idx));
                    }}
                    className={`w-full text-left p-3.5 rounded-btn border text-xs font-medium transition ${
                      answer === String(idx)
                        ? "bg-brand-blue text-white border-brand-blue font-bold shadow-sm"
                        : "bg-brand-mist border-brand-line text-brand-ink hover:bg-brand-blue-50"
                    }`}
                  >
                    {idx + 1}. {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* АЛГОРИТМИКА (PYTHON) */}
        {currentStep.type === "CODE" && (
          <div className="space-y-4">
            <div className="bg-brand-mist border border-brand-line rounded-card p-4 text-xs text-brand-ink space-y-1">
              <div className="font-bold">Условие задачи:</div>
              <p>{payload.task}</p>
            </div>

            <textarea
              rows={8}
              value={answer || payload.starterCode || ""}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full font-mono text-xs border border-brand-line rounded-card p-4 bg-brand-night text-emerald-400 focus:outline-none"
            />

            <button
              onClick={() => handleSubmit(answer || payload.starterCode)}
              disabled={loading}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs px-6 py-3 rounded-btn transition shadow-md"
            >
              {loading ? "Запуск тестов..." : "Запустить и проверить код ▶"}
            </button>
          </div>
        )}

        {/* SCRATCH / MINECRAFT / ПРОЕКТ */}
        {(currentStep.type === "SCRATCH" || currentStep.type === "MINECRAFT" || currentStep.type === "PROJECT") && (
          <div className="space-y-4">
            <div className="bg-brand-mist border border-brand-line rounded-card p-4 text-xs text-brand-ink space-y-1">
              <div className="font-bold">Задание для куратора:</div>
              <p>{payload.task}</p>
            </div>

            <input
              type="text"
              placeholder="Вставьте ссылку на проект Scratch или скриншот мира Minecraft..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full text-xs border border-brand-line rounded-field p-3 bg-brand-mist/50 font-mono"
            />

            <button
              onClick={() => handleSubmit()}
              disabled={loading || !answer.trim()}
              className="bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs px-6 py-3 rounded-btn transition shadow-md"
            >
              {loading ? "Отправка..." : "Отправить куратору на рецензию →"}
            </button>
          </div>
        )}

        {/* РЕЗУЛЬТАТ ПРОВЕРКИ + КНОПКА СЛЕДУЮЩЕГО ШАГА */}
        {result && (
          <div
            className={`p-5 rounded-card border text-xs space-y-3 transition-all ${
              result.status === "ACCEPTED"
                ? "bg-st-done-bg border-st-done text-st-done"
                : result.status === "REJECTED"
                ? "bg-st-failed-bg border-st-failed text-st-failed"
                : "bg-st-review-bg border-st-review text-st-review"
            }`}
          >
            <div className="font-bold flex items-center justify-between text-sm">
              <span>
                {result.status === "ACCEPTED"
                  ? "✓ Задание успешно зачтено!"
                  : result.status === "REJECTED"
                  ? "✕ Есть ошибки, попробуй ещё раз"
                  : "⏳ Работа в очереди куратора. Можешь двигаться дальше!"}
              </span>
              <span className="font-mono font-bold text-brand-ink">
                +{result.score} б.
              </span>
            </div>

            {result.feedback && (
              <pre className="text-[11px] whitespace-pre-wrap font-sans opacity-90">
                {result.feedback}
              </pre>
            )}

            {/* КНОПКА ПЕРЕХОДА ДАЛЬШЕ (Пункт 3 твоего вопроса) */}
            {nextStep && (
              <div className="pt-2">
                <Link
                  href={`/student/course/${course.id}/step/${nextStep.id}?studentId=${studentId}`}
                  className="inline-block bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs px-5 py-2.5 rounded-btn transition shadow-md"
                >
                  Перейти к следующему шагу: {nextStep.title} →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}