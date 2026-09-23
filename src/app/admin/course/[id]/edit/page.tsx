"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CourseEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [stepTitle, setStepTitle] = useState("");
  const [stepType, setStepType] = useState("CODE");
  const [maxScore, setMaxScore] = useState(25);
  const [stepPayload, setStepPayload] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchCourse = () => {
    fetch(`/api/courses/${params.id}`)
      .then((res) => res.json())
      .then((data) => setCourse(data.course));
  };

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const isAutoCheck = stepType === "QUIZ" || stepType === "CODE";

    await fetch("/api/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: params.id,
        title: stepTitle,
        type: stepType,
        maxScore,
        isAutoCheck,
        payloadJson: stepPayload || JSON.stringify({ task: "Описание задачи" }),
      }),
    });

    setStepTitle("");
    setStepPayload("");
    setIsAdding(false);
    fetchCourse();
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("Удалить этот шаг из курса?")) return;
    await fetch(`/api/steps?stepId=${stepId}`, { method: "DELETE" });
    fetchCourse();
  };

  if (!course) return <div className="p-8 text-center text-xs text-zinc-400">Загрузка...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <Link href="/admin" className="text-xs text-zinc-400 hover:text-zinc-800 transition">
        ← Вернуться к списку курсов
      </Link>

      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-4">
        <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-100 rounded">
          {course.gradeRange}
        </span>
        <h1 className="text-2xl font-bold text-zinc-950">{course.title}</h1>
        <p className="text-xs text-zinc-500">{course.description}</p>
      </div>

      {/* Список существующих шагов */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-900">
          Шаги курса ({course.steps?.length || 0})
        </h2>
        <div className="space-y-2">
          {course.steps?.map((step: any, idx: number) => (
            <div
              key={step.id}
              className="bg-white border border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-600 font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-xs font-semibold text-zinc-900">{step.title}</div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    {step.type} · {step.maxScore} б. · {step.isAutoCheck ? "Авто" : "Куратор"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteStep(step.id)}
                className="text-xs text-rose-500 hover:text-rose-700 transition px-2 py-1"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Форма добавления нового полиморфного шага */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-zinc-900">Добавить новый шаг в курс</h2>

        <form onSubmit={handleAddStep} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Название шага
              </label>
              <input
                type="text"
                required
                placeholder="например, Двумерные массивы в Scratch"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                className="w-full text-xs border rounded-xl p-2.5 bg-zinc-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Тип среды
              </label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value)}
                className="w-full text-xs border rounded-xl p-2.5 bg-zinc-50/50"
              >
                <option value="CODE">Алгоритмика (Код)</option>
                <option value="SCRATCH">Scratch (Блоки)</option>
                <option value="MINECRAFT">Minecraft Education</option>
                <option value="QUIZ">Контрольный тест</option>
                <option value="THEORY">Теория / Текст</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              JSON конфигурация задания
            </label>
            <textarea
              rows={3}
              value={stepPayload}
              onChange={(e) => setStepPayload(e.target.value)}
              placeholder='{"task": "Напишите программу для решения...", "starterCode": "..."}'
              className="w-full font-mono text-xs border rounded-xl p-3 bg-zinc-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={isAdding || !stepTitle}
            className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs px-6 py-2.5 rounded-xl transition"
          >
            {isAdding ? "Добавление..." : "+ Добавить шаг в программу"}
          </button>
        </form>
      </div>
    </div>
  );
}