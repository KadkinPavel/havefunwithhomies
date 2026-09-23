"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm({ onCancel }: { onCancel?: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("5");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ fullName, grade, school, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации");

      // Успешно: обновляем страницу, чтобы отобразить кабинет ученика
      router.push(`/student?studentId=${data.student.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="mb-6 text-center">
        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full">
          ФСП Чувашской Республики
        </span>
        <h2 className="text-2xl font-semibold text-zinc-950 mt-3 tracking-tight">
          Регистрация спортсмена
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Введите данные школьника для доступа к учебным материалам 1–9 классов
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Фамилия и Имя ученика
          </label>
          <input
            type="text"
            required
            placeholder="например, Артем Васильев"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Класс (1–9)
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full text-xs border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50 transition"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  {g} класс
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
              Школа / Лицей
            </label>
            <input
              type="text"
              placeholder="Лицей №3"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50 transition"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Электронная почта
          </label>
          <input
            type="email"
            required
            placeholder="student@fsp21.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-zinc-50/50 transition"
          />
        </div>

        <div className="pt-2 flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium text-xs py-2.5 rounded-xl transition"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-medium text-xs py-2.5 rounded-xl transition shadow-sm"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться →"}
          </button>
        </div>
      </form>
    </div>
  );
}