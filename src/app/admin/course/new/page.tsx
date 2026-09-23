"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [gradeRange, setGradeRange] = useState("1-4 класс");
  const [description, setDescription] = useState("");
  const [stepType, setStepType] = useState("SCRATCH");
  const [stepTitle, setStepTitle] = useState("");
  const [stepPayload, setStepPayload] = useState("");

  const handleCreate = async () => {
    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        gradeRange,
        description,
        steps: [
          {
            title: stepTitle || "Вводное практическое задание",
            type: stepType,
            order: 1,
            isAutoCheck: stepType === "QUIZ" || stepType === "CODE",
            payloadJson: stepPayload || JSON.stringify({ instructions: "Выполните проект по схеме" })
          }
        ]
      })
    });
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Конструктор курса (Администратор)</h1>
      <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Название курса</label>
          <input
            type="text"
            className="w-full border rounded-xl p-2.5 text-sm"
            placeholder="например, Олимпиадный Scratch: Уровень 1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Целевая группа</label>
          <select
            className="w-full border rounded-xl p-2.5 text-sm"
            value={gradeRange}
            onChange={(e) => setGradeRange(e.target.value)}
          >
            <option>1-4 класс</option>
            <option>5-9 класс</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Описание программы</label>
          <textarea
            className="w-full border rounded-xl p-2.5 text-sm"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Добавление первого шага курса</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Тип шага (Архитектура типов)</label>
              <select
                className="w-full border rounded-xl p-2 text-sm"
                value={stepType}
                onChange={(e) => setStepType(e.target.value)}
              >
                <option value="SCRATCH">Scratch (Блочное моделирование)</option>
                <option value="MINECRAFT">Minecraft Education (Задание в среде)</option>
                <option value="CODE">Алгоритмика (Код с автотестами)</option>
                <option value="QUIZ">Контрольный тест</option>
                <option value="THEORY">Теория / Лекция</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Название шага</label>
              <input
                type="text"
                className="w-full border rounded-xl p-2 text-sm"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                placeholder="Задание №1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 block mb-1">Конфигурация шага (JSON Payload)</label>
            <textarea
              className="w-full font-mono text-xs border rounded-xl p-2"
              rows={3}
              value={stepPayload}
              onChange={(e) => setStepPayload(e.target.value)}
              placeholder='{"task": "Соберите лабиринт", "tests": []}'
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!title}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition"
        >
          Опубликовать курс в системе
        </button>
      </div>
    </div>
  );
}