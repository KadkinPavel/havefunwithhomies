"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VisualNewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [gradeRange, setGradeRange] = useState("5-9 класс");
  const [description, setDescription] = useState("");

  // Параметры первого шага
  const [stepTitle, setStepTitle] = useState("");
  const [stepType, setStepType] = useState("QUIZ");
  const [maxScore, setMaxScore] = useState(20);

  // Визуальные поля для ТЕСТА
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOption1, setQuizOption1] = useState("");
  const [quizOption2, setQuizOption2] = useState("");
  const [quizOption3, setQuizOption3] = useState("");
  const [quizCorrect, setQuizCorrect] = useState(0);

  // Визуальные поля для ТЕОРИИ / SCRATCH / MINECRAFT
  const [taskText, setTaskText] = useState("");

  // Визуальные поля для КОДА
  const [codeTask, setCodeTask] = useState("");
  const [testInput, setTestInput] = useState("5");
  const [testOutput, setTestOutput] = useState("25");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Автоматическая сборка payloadJson без участия пользователя
    let payload: any = {};

    if (stepType === "QUIZ") {
      payload = {
        question: quizQuestion || "Контрольный вопрос",
        options: [quizOption1 || "Вариант А", quizOption2 || "Вариант Б", quizOption3 || "Вариант В"],
        correctIndex: Number(quizCorrect),
      };
    } else if (stepType === "CODE") {
      payload = {
        task: codeTask || "Напишите программу",
        starterCode: "function solve(input) {\n  return Number(input) * 2;\n}",
        testCases: [{ input: testInput, expectedOutput: testOutput }],
      };
    } else {
      payload = {
        task: taskText || "Инструкция к практическому заданию",
        text: taskText || "Материал для изучения",
      };
    }

    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        gradeRange,
        description,
        steps: [
          {
            title: stepTitle || "Вводное задание",
            type: stepType,
            order: 1,
            maxScore: Number(maxScore),
            isAutoCheck: stepType === "QUIZ" || stepType === "CODE",
            payloadJson: JSON.stringify(payload),
          },
        ],
      }),
    });

    setLoading(false);
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <Link href="/admin" className="text-xs text-zinc-400 hover:text-zinc-900 transition">
        ← Вернуться к списку курсов
      </Link>

      <div className="border-b border-zinc-200/80 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
          Конструктор нового курса
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Создание программы для школьников 1–9 классов Чувашской Республики
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Карточка 1: О курсе */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Основная информация</h2>
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Название курса
            </label>
            <input
              type="text"
              required
              placeholder="например, Олимпиадное программирование: Начальный уровень"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border rounded-xl p-3 bg-zinc-50/50 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Возрастная группа
              </label>
              <select
                value={gradeRange}
                onChange={(e) => setGradeRange(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-zinc-50/50 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              >
                <option value="1-4 класс">1–4 классы (Начальная школа)</option>
                <option value="5-9 класс">5–9 классы (Средняя школа)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Краткое описание
              </label>
              <input
                type="text"
                placeholder="Для кого предназначен курс и какие навыки развивает"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-zinc-50/50 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Карточка 2: Конструктор первого шага */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Первый шаг курса</h2>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
              Полиморфный модуль
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Название шага
              </label>
              <input
                type="text"
                required
                placeholder="например, Тест по логике или Проект в Scratch"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-zinc-50/50 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Тип шага
              </label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-zinc-50/50 font-semibold focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              >
                <option value="QUIZ">Контрольный вопрос (Тест)</option>
                <option value="CODE">Алгоритмика (Код с автотестом)</option>
                <option value="SCRATCH">Проект в Scratch</option>
                <option value="MINECRAFT">Minecraft Education</option>
                <option value="THEORY">Теория (Лекция)</option>
              </select>
            </div>
          </div>

          {/* ДИНАМИЧЕСКИЕ ВИЗУАЛЬНЫЕ ПОЛЯ ДЛЯ ТЕСТА */}
          {stepType === "QUIZ" && (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
              <div className="text-xs font-semibold text-zinc-800">
                Конструктор теста с мгновенной проверкой:
              </div>
              <input
                type="text"
                placeholder="Текст вопроса (например: Сколько бит в одном байте?)"
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                className="w-full text-xs border rounded-xl p-2.5 bg-white"
              />
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Вариант 1 (Индекс 0)"
                  value={quizOption1}
                  onChange={(e) => setQuizOption1(e.target.value)}
                  className="w-full text-xs border rounded-xl p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="Вариант 2 (Индекс 1)"
                  value={quizOption2}
                  onChange={(e) => setQuizOption2(e.target.value)}
                  className="w-full text-xs border rounded-xl p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="Вариант 3 (Индекс 2)"
                  value={quizOption3}
                  onChange={(e) => setQuizOption3(e.target.value)}
                  className="w-full text-xs border rounded-xl p-2 bg-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-zinc-600">Правильный ответ:</label>
                <select
                  value={quizCorrect}
                  onChange={(e) => setQuizCorrect(Number(e.target.value))}
                  className="text-xs border rounded-lg p-1.5 bg-white font-semibold"
                >
                  <option value={0}>Вариант 1</option>
                  <option value={1}>Вариант 2</option>
                  <option value={2}>Вариант 3</option>
                </select>
              </div>
            </div>
          )}

          {/* ДИНАМИЧЕСКИЕ ПОЛЯ ДЛЯ КОДА */}
          {stepType === "CODE" && (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3">
              <div className="text-xs font-semibold text-zinc-800">
                Параметры олимпиадной задачи:
              </div>
              <textarea
                rows={2}
                placeholder="Условие задачи (например: Напишите функцию, удваивающую число)"
                value={codeTask}
                onChange={(e) => setCodeTask(e.target.value)}
                className="w-full text-xs border rounded-xl p-2.5 bg-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">
                    Тестовый ввод (Input):
                  </label>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full text-xs border rounded-xl p-2 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 block mb-1">
                    Ожидаемый ответ (Output):
                  </label>
                  <input
                    type="text"
                    value={testOutput}
                    onChange={(e) => setTestOutput(e.target.value)}
                    className="w-full text-xs border rounded-xl p-2 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ДИНАМИЧЕСКИЕ ПОЛЯ ДЛЯ SCRATCH, MINECRAFT, ТЕОРИИ */}
          {(stepType === "SCRATCH" || stepType === "MINECRAFT" || stepType === "THEORY") && (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-2">
              <div className="text-xs font-semibold text-zinc-800">
                {stepType === "THEORY"
                  ? "Текст лекции / теоретического материала:"
                  : "Инструкция к заданию для школьника:"}
              </div>
              <textarea
                rows={4}
                placeholder={
                  stepType === "THEORY"
                    ? "Напишите учебный текст..."
                    : "Опишите, что школьник должен собрать и какую ссылку прикрепить..."
                }
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="w-full text-xs border rounded-xl p-3 bg-white"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs text-zinc-500">Баллы за выполнение:</label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="w-20 text-xs border rounded-xl p-2 bg-zinc-50/50 font-mono font-bold text-center"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title || !stepTitle}
          className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs py-3.5 rounded-2xl transition shadow-sm"
        >
          {loading ? "Публикация курса..." : "Опубликовать курс в системе →"}
        </button>
      </form>
    </div>
  );
}