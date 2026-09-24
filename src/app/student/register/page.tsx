"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterStudentPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("4");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [preferredTrack, setPreferredTrack] = useState("scratch");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, grade, school, email, preferredTrack }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации");

      // Успешно: переходим в личный кабинет созданного ученика
      router.push(`/student?studentId=${data.student.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <Link href="/student" className="text-xs text-brand-ink-3 hover:text-brand-ink mb-6 inline-block">
        ← Назад к личному кабинету
      </Link>

      <div className="bg-white border border-brand-line rounded-card p-8 shadow-sm space-y-5">
        <div className="text-center">
          <span className="text-[10px] font-mono uppercase bg-brand-blue-50 text-brand-blue px-2.5 py-1 rounded-pill font-bold">
            ФСП ЧУВАШИИ · 1–9 КЛАССЫ
          </span>
          <h1 className="text-xl font-bold text-brand-ink mt-3">Регистрация спортсмена</h1>
          <p className="text-xs text-brand-ink-2 mt-1">
            Каждый ученик автоматически прикрепляется к личному куратору
          </p>
        </div>

        {error && (
          <div className="p-3 bg-st-failed-bg text-st-failed rounded-btn text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-ink-2 block mb-1">
              Фамилия и Имя
            </label>
            <input
              type="text"
              required
              placeholder="например, Денис Смирнов"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs border border-brand-line rounded-field p-2.5 bg-brand-mist/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-brand-ink-2 block mb-1">
                Класс
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full text-xs border border-brand-line rounded-field p-2.5 bg-brand-mist/50"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                  <option key={g} value={g}>{g} класс</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-ink-2 block mb-1">
                Школа / Лицей
              </label>
              <input
                type="text"
                placeholder="Лицей №3"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full text-xs border border-brand-line rounded-field p-2.5 bg-brand-mist/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-ink-2 block mb-1">
              Инструмент / Направление (Закрепление за куратором)
            </label>
            <select
              value={preferredTrack}
              onChange={(e) => setPreferredTrack(e.target.value)}
              className="w-full text-xs border border-brand-line rounded-field p-2.5 bg-brand-mist/50 font-semibold text-brand-blue"
            >
              <option value="scratch">Scratch (Куратор Анна Сергеевна)</option>
              <option value="minecraft">Minecraft Education (Куратор Дмитрий Алексеев)</option>
              <option value="python">Алгоритмика Python (Куратор Елена Николаева)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-ink-2 block mb-1">
              Электронная почта
            </label>
            <input
              type="email"
              required
              placeholder="denis@fsp21.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs border border-brand-line rounded-field p-2.5 bg-brand-mist/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-40 text-white font-bold text-xs py-3 rounded-btn transition shadow-md"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться и начать обучение →"}
          </button>
        </form>
      </div>
    </div>
  );
}