"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseEditorClient({ course }: { course: any }) {
  const router = useRouter();
  const [stepTitle, setStepTitle] = useState("");
  const [stepType, setStepType] = useState("QUIZ");
  const [taskText, setTaskText] = useState("");
  const [maxScore, setMaxScore] = useState(20);
  const [loading, setLoading] = useState(false);

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      task: taskText || "Инструкция к заданию",
      text: taskText || "Теоретический материал",
    };

    await fetch("/api/steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: course.id,
        title: stepTitle,
        type: stepType,
        maxScore,
        isAutoCheck: stepType === "QUIZ" || stepType === "CODE" || stepType === "THEORY",
        payloadJson: JSON.stringify(payload),
      }),
    });

    setStepTitle("");
    setTaskText("");
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (stepId: string) => {
    if (!confirm("Удалить этот шаг?")) return;
    await fetch(`/api/steps?stepId=${stepId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-brand-ink">
          Шаги программы ({course.steps.length})
        </h2>
        <div className="space-y-2">
          {course.steps.map((st: any, i: number) => (
            <div
              key={st.id}
              className="bg-white border border-brand-line rounded-card p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-btn bg-brand-mist text-brand-ink-2 font-mono text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <div>
                  <div className="text-xs font-semibold text-brand-ink">{st.title}</div>
                  <span className="text-[10px] font-mono text-brand-ink-3 uppercase">
                    {st.type} · {st.maxScore} б.
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(st.id)}
                className="text-xs text-st-failed hover:underline font-medium px-2 py-1"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddStep} className="bg-white border border-brand-line rounded-card p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-brand-ink">+ Добавить шаг в курс</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-brand-ink-2 block mb-1">Название шага</label>
            <input
              type="text"
              required
              placeholder="например, Тест по циклам"
              value={stepTitle}
              onChange={(e) => setStepTitle(e.target.value)}
              className="w-full text-xs border border-brand-line rounded-btn p-2.5 bg-brand-mist/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-ink-2 block mb-1">Тип шага</label>
            <select
              value={stepType}
              onChange={(e) => setStepType(e.target.value)}
              className="w-full text-xs border border-brand-line rounded-btn p-2.5 bg-brand-mist/50 font-semibold"
            >
              <option value="THEORY">Теория</option>
              <option value="QUIZ">Тест</option>
              <option value="SCRATCH">Scratch</option>
              <option value="MINECRAFT">Minecraft</option>
              <option value="CODE">Алгоритмика (Python)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-brand-ink-2 block mb-1">Описание задания для школьника</label>
          <textarea
            rows={2}
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Инструкция к шагу..."
            className="w-full text-xs border border-brand-line rounded-btn p-2.5 bg-brand-mist/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !stepTitle}
          className="bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-40 text-white font-medium text-xs px-5 py-2.5 rounded-btn transition"
        >
          {loading ? "Сохранение..." : "Добавить в курс"}
        </button>
      </form>
    </div>
  );
}