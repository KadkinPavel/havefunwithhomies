"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardClient({
  curators,
  rawCurators,
  students,
  courses,
}: {
  curators: any[];
  rawCurators: { id: string; name: string }[];
  students: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"curators" | "students" | "courses">("curators");

  // Состояния модалок
  const [showCuratorModal, setShowCuratorModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Поля формы нового куратора
  const [curatorName, setCuratorName] = useState("");
  const [curatorEmail, setCuratorEmail] = useState("");
  const [curatorSpec, setCuratorSpec] = useState("Scratch");

  // Поля формы нового ученика
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("4");
  const [studentSchool, setStudentSchool] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [targetCurator, setTargetCurator] = useState(rawCurators[0]?.id || "");

  const [loading, setLoading] = useState(false);

  // Создание куратора
  const handleCreateCurator = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "CURATOR",
        name: curatorName,
        email: curatorEmail,
        specialization: curatorSpec,
      }),
    });

    setCuratorName("");
    setCuratorEmail("");
    setShowCuratorModal(false);
    setLoading(false);
    router.refresh();
  };

  // Создание ученика
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "STUDENT",
        fullName: studentName,
        grade: studentGrade,
        school: studentSchool,
        email: studentEmail,
        curatorId: targetCurator,
      }),
    });

    setStudentName("");
    setStudentEmail("");
    setShowStudentModal(false);
    setLoading(false);
    router.refresh();
  };

  // Смена куратора у ученика
  const handleReassignCurator = async (studentId: string, newCuratorId: string) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, newCuratorId }),
    });
    router.refresh();
  };

  // Подсчет общих показателей
  const totalPending = curators.reduce((acc, c) => acc + c.pendingCount, 0);

  return (
    <div className="space-y-6">
      {/* Шапка администратора */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-line pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-brand-sky uppercase bg-brand-night px-2.5 py-1 rounded font-bold">
            Административный контур · ФСП ЧУВАШИИ
          </span>
          <h1 className="text-2xl font-bold text-brand-ink mt-2">
            Панель методиста и координатора
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCuratorModal(true)}
            className="bg-white border border-brand-line hover:border-brand-blue text-brand-ink font-semibold text-xs px-3.5 py-2 rounded-btn transition shadow-sm"
          >
            + Добавить куратора
          </button>
          <button
            onClick={() => setShowStudentModal(true)}
            className="bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold text-xs px-3.5 py-2 rounded-btn transition shadow-sm"
          >
            + Зарегистрировать ученика
          </button>
        </div>
      </div>

      {/* Быстрые KPI карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-line rounded-card p-4 shadow-sm">
          <div className="text-xs text-brand-ink-3">Спортсменов</div>
          <div className="text-2xl font-bold font-mono text-brand-ink mt-1">{students.length}</div>
        </div>
        <div className="bg-white border border-brand-line rounded-card p-4 shadow-sm">
          <div className="text-xs text-brand-ink-3">Кураторов ФСП</div>
          <div className="text-2xl font-bold font-mono text-brand-blue mt-1">{curators.length}</div>
        </div>
        <div className="bg-white border border-brand-line rounded-card p-4 shadow-sm">
          <div className="text-xs text-brand-ink-3">Ждут проверки</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${totalPending > 0 ? "text-brand-amber-text" : "text-st-done"}`}>
            {totalPending}
          </div>
        </div>
        <div className="bg-white border border-brand-line rounded-card p-4 shadow-sm">
          <div className="text-xs text-brand-ink-3">Курсов в базе</div>
          <div className="text-2xl font-bold font-mono text-brand-ink mt-1">{courses.length}</div>
        </div>
      </div>

      {/* Переключатель вкладок */}
      <div className="flex border-b border-brand-line gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("curators")}
          className={`pb-3 transition relative ${
            activeTab === "curators"
              ? "text-brand-blue border-b-2 border-brand-blue"
              : "text-brand-ink-2 hover:text-brand-ink"
          }`}
        >
          Кураторы и нагрузка ({curators.length})
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 transition relative ${
            activeTab === "students"
              ? "text-brand-blue border-b-2 border-brand-blue"
              : "text-brand-ink-2 hover:text-brand-ink"
          }`}
        >
          Ученики и прогресс ({students.length})
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`pb-3 transition relative ${
            activeTab === "courses"
              ? "text-brand-blue border-b-2 border-brand-blue"
              : "text-brand-ink-2 hover:text-brand-ink"
          }`}
        >
          Управление курсами ({courses.length})
        </button>
      </div>

      {/* ВКЛАДКА 1: КУРАТОРЫ И ИХ МЕТРИКИ */}
      {activeTab === "curators" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {curators.map((c) => (
              <div key={c.id} className="bg-white border border-brand-line rounded-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-brand-ink">{c.name}</h3>
                      <p className="text-[11px] text-brand-ink-3 font-mono">{c.email}</p>
                    </div>
                    {c.pendingCount > 0 && (
                      <span className="text-[10px] font-bold bg-brand-amber-50 text-brand-amber-text px-2 py-0.5 rounded-pill">
                        +{c.pendingCount} на проверке
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-brand-line text-xs font-mono">
                    <div className="bg-brand-mist p-2.5 rounded-field">
                      <div className="text-[10px] text-brand-ink-3 uppercase">Учеников</div>
                      <div className="text-base font-bold text-brand-ink">{c.studentsCount}</div>
                    </div>
                    <div className="bg-brand-mist p-2.5 rounded-field">
                      <div className="text-[10px] text-brand-ink-3 uppercase">Проверено</div>
                      <div className="text-base font-bold text-st-done">{c.reviewedCount}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-brand-ink-2 block mb-1.5">
                      Закрепленные школьники:
                    </span>
                    {c.studentsList.length === 0 ? (
                      <span className="text-[11px] text-brand-ink-3 italic">Ученики пока не прикреплены</span>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {c.studentsList.map((st: any) => (
                          <div key={st.id} className="text-[11px] flex justify-between bg-brand-mist/60 px-2 py-1 rounded">
                            <span className="truncate">{st.name.split(" ")[0]} {st.name.split(" ")[1]?.[0]}.</span>
                            <span className="text-brand-ink-3 font-mono">
                              {new Date(st.lastActiveAt).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/curator?curatorId=${c.id}`}
                  className="block text-center text-xs font-bold text-brand-blue bg-brand-blue-50 hover:bg-brand-blue hover:text-white py-2 rounded-btn transition"
                >
                  Перейти в очередь куратора →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ВКЛАДКА 2: УЧЕНИКИ И ДЕТАЛЬНЫЙ ПРОГРЕСС */}
      {activeTab === "students" && (
        <div className="bg-white border border-brand-line rounded-card overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-mist border-b border-brand-line text-[11px] font-mono text-brand-ink-3 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Спортсмен</th>
                <th className="py-3 px-4">Темп</th>
                <th className="py-3 px-4">Куратор</th>
                <th className="py-3 px-4">Прогресс по олимпиадным курсам</th>
                <th className="py-3 px-4 text-right">Рейтинг</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-brand-mist/50 transition">
                  <td className="py-4 px-4">
                    <div className="font-bold text-brand-ink text-sm">{st.name}</div>
                    <div className="text-[11px] text-brand-ink-3 font-mono">{st.email}</div>
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${
                        st.statusColor === "st-done"
                          ? "bg-st-done-bg text-st-done"
                          : st.statusColor === "brand-amber"
                          ? "bg-brand-amber-50 text-brand-amber-text"
                          : "bg-st-failed-bg text-st-failed"
                      }`}
                    >
                      ● {st.statusText}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={st.curatorId || ""}
                      onChange={(e) => handleReassignCurator(st.id, e.target.value)}
                      className="text-xs border border-brand-line rounded-field p-1 bg-white font-medium"
                    >
                      {rawCurators.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name.split(" ")[0]} ({c.name.split("·")[1]?.replace(")", "").trim() || "ФСП"})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-4 px-4">
                    <div className="space-y-1.5 min-w-[200px]">
                      {st.courseProgress.map((cp: any) => (
                        <div key={cp.courseId}>
                          <div className="flex justify-between text-[10px] font-mono text-brand-ink-2">
                            <span className="truncate max-w-[140px]">{cp.courseTitle}</span>
                            <span>{cp.passed}/{cp.total} ({cp.percent}%)</span>
                          </div>
                          <div className="w-full bg-brand-line h-1.5 rounded-pill overflow-hidden mt-0.5">
                            <div
                              className="bg-brand-blue h-full"
                              style={{ width: `${cp.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-bold text-sm text-brand-ink">
                    {st.totalScore} б.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ВКЛАДКА 3: КУРСЫ */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-brand-ink">Все образовательные курсы</h2>
            <Link
              href="/admin/course/new"
              className="bg-brand-blue text-white text-xs font-bold px-3 py-1.5 rounded-btn"
            >
              + Создать новый курс
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {courses.map((c) => (
              <div key={c.id} className="bg-white border border-brand-line rounded-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-brand-mist text-brand-ink-2 rounded">
                    {c.gradeRange}
                  </span>
                  <h3 className="font-bold text-sm text-brand-ink mt-2">{c.title}</h3>
                  <p className="text-xs text-brand-ink-3 line-clamp-2 mt-1">{c.description}</p>
                  <div className="mt-3 text-[11px] font-mono text-brand-ink-2">
                    Шагов в курсе: <strong>{c.steps.length}</strong>
                  </div>
                </div>

                <Link
                  href={`/admin/course/${c.id}/edit`}
                  className="block text-center text-xs font-bold border border-brand-line hover:border-brand-blue text-brand-ink py-2 rounded-btn transition"
                >
                  Редактировать шаги ⚙
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ДОБАВЛЕНИЕ КУРАТОРА */}
      {showCuratorModal && (
        <div className="fixed inset-0 bg-brand-night/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-line rounded-card p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-brand-ink">Добавить куратора ФСП</h3>
            <form onSubmit={handleCreateCurator} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">ФИО куратора</label>
                <input
                  type="text"
                  required
                  placeholder="Михаил Григорьев"
                  value={curatorName}
                  onChange={(e) => setCuratorName(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Специализация</label>
                <select
                  value={curatorSpec}
                  onChange={(e) => setCuratorSpec(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50 font-semibold"
                >
                  <option value="Scratch">Scratch (Начальные классы)</option>
                  <option value="Minecraft">Minecraft Education (Инженерия)</option>
                  <option value="Python">Алгоритмика Python (Олимпиады)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Рабочий Email</label>
                <input
                  type="email"
                  required
                  placeholder="mikhail@fsp21.ru"
                  value={curatorEmail}
                  onChange={(e) => setCuratorEmail(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCuratorModal(false)}
                  className="w-1/2 bg-brand-mist text-brand-ink text-xs font-semibold py-2 rounded-btn"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-brand-blue text-white text-xs font-bold py-2 rounded-btn"
                >
                  {loading ? "Сохранение..." : "Добавить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: РЕГИСТРАЦИЯ УЧЕНИКА АДМИНИСТРАТОРОМ */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-brand-night/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-line rounded-card p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-brand-ink">Зарегистрировать ученика</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Фамилия и Имя</label>
                <input
                  type="text"
                  required
                  placeholder="Илья Сергеев"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Класс</label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value)}
                    className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                      <option key={g} value={g}>{g} класс</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Школа</label>
                  <input
                    type="text"
                    placeholder="СОШ №59"
                    value={studentSchool}
                    onChange={(e) => setStudentSchool(e.target.value)}
                    className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Назначить куратора</label>
                <select
                  value={targetCurator}
                  onChange={(e) => setTargetCurator(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50 font-semibold text-brand-blue"
                >
                  {rawCurators.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-brand-ink-2 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="ilya@fsp21.ru"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full text-xs border border-brand-line rounded-field p-2 bg-brand-mist/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="w-1/2 bg-brand-mist text-brand-ink text-xs font-semibold py-2 rounded-btn"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-brand-blue text-white text-xs font-bold py-2 rounded-btn"
                >
                  {loading ? "Сохранение..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}