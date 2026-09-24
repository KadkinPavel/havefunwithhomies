import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStudentRating } from "@/lib/analytics";

export default async function StudentPage({
  searchParams,
}: {
  searchParams: { studentId?: string; courseId?: string };
}) {
  const allStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { curator: true },
    orderBy: { createdAt: "asc" },
  });

  if (allStudents.length === 0) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm text-brand-ink-2">Ученики пока не зарегистрированы</p>
        <Link href="/student/register" className="bg-brand-blue text-white px-4 py-2 rounded-btn text-xs font-bold">
          Зарегистрировать первого ученика
        </Link>
      </div>
    );
  }

  const currentStudent =
    allStudents.find((s) => s.id === searchParams.studentId) || allStudents[0];

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: {
          submissions: {
            where: { studentId: currentStudent.id },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  // Требование №3: Свободный выбор любого курса
  const activeCourse =
    courses.find((c) => c.id === searchParams.courseId) || courses[0];
  const steps = activeCourse?.steps || [];

  const nextStep =
    steps.find((s) => s.submissions[0]?.status !== "ACCEPTED") || steps[0];
  const nextStepIndex = steps.findIndex((s) => s.id === nextStep?.id) + 1;

  const { totalPoints } = await getStudentRating(currentStudent.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 role-student">
      {/* Верхний бар: смена ученика и регистрация нового */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-brand-line p-4 rounded-card text-xs">
        <div className="flex items-center gap-2">
          <span className="text-brand-ink-3">Спортсмен:</span>
          <span className="font-bold text-brand-ink">{currentStudent.name}</span>
          <span className="text-[11px] text-brand-blue bg-brand-blue-50 px-2 py-0.5 rounded font-medium">
            Куратор: {currentStudent.curator?.name?.split(" ")[0] || "Назначен"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-brand-ink-3 text-[11px]">Сменить:</span>
            {allStudents.map((st) => (
              <Link
                key={st.id}
                href={`/student?studentId=${st.id}&courseId=${activeCourse.id}`}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                  st.id === currentStudent.id
                    ? "bg-brand-blue text-white font-bold"
                    : "bg-brand-mist hover:bg-brand-blue-50 text-brand-ink-2"
                }`}
              >
                {st.name.split(" ")[0]}
              </Link>
            ))}
          </div>

          <Link
            href="/student/register"
            className="text-[11px] font-bold text-brand-blue hover:underline"
          >
            + Зарегистрировать еще
          </Link>
        </div>
      </div>

      {/* ТАБЫ ВЫБОРА КУРСА: Школьник может учиться на любом курсе */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink-3">
          Выбор олимпиадной дисциплины:
        </span>
        <div className="grid md:grid-cols-3 gap-3">
          {courses.map((c) => {
            const completed = c.steps.filter((s) => s.submissions[0]?.status === "ACCEPTED").length;
            const isSelected = c.id === activeCourse.id;

            return (
              <Link
                key={c.id}
                href={`/student?studentId=${currentStudent.id}&courseId=${c.id}`}
                className={`p-4 rounded-card border transition text-left flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-brand-blue ring-2 ring-brand-blue-200 shadow-sm"
                    : "bg-white border-brand-line hover:border-brand-ink-3"
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-brand-mist text-brand-ink-2 rounded">
                    {c.gradeRange}
                  </span>
                  <div className="font-bold text-xs text-brand-ink mt-1.5">{c.title}</div>
                </div>
                <div className="text-[11px] text-brand-ink-3 mt-3 font-mono">
                  Пройдено: {completed} из {c.steps.length}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* КАРТА ТЕКУЩЕГО КУРСА */}
      <div className="bg-white border border-brand-line rounded-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-brand-ink-2">
          <span className="font-semibold uppercase tracking-wider text-brand-blue">
            Карта курса · {activeCourse.title}
          </span>
          <span className="font-mono">Шаг {nextStepIndex} из {steps.length}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {steps.map((st, i) => {
            const isDone = st.submissions[0]?.status === "ACCEPTED";
            const isCurrent = st.id === nextStep?.id;

            return (
              <div key={st.id} className="flex items-center gap-2">
                <Link
                  href={`/student/course/${activeCourse.id}/step/${st.id}?studentId=${currentStudent.id}`}
                  className={`w-10 h-10 rounded-btn flex items-center justify-center font-bold text-xs transition ${
                    isCurrent
                      ? "bg-brand-blue text-white ring-4 ring-brand-blue-200 shadow-md scale-105"
                      : isDone
                      ? "bg-st-done text-white"
                      : "bg-brand-mist border border-brand-line text-brand-ink-2"
                  }`}
                  title={st.title}
                >
                  {isDone ? "✓" : i + 1}
                </Link>
                {i < steps.length - 1 && (
                  <div className={`w-4 h-[2px] ${isDone ? "bg-st-done" : "bg-brand-line"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ДВА ГЛАВНЫХ ЭКРАНА: СЛЕДУЮЩИЙ ШАГ И РЕЙТИНГ */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {nextStep && (
          <div className="bg-brand-night text-white rounded-card p-8 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-brand-night-2">
            <div className="space-y-3 z-10">
              <span className="text-xs font-mono tracking-widest text-brand-sky uppercase">
                СЛЕДУЮЩИЙ ШАГ · {nextStepIndex} ИЗ {steps.length}
              </span>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                {nextStep.title}
              </h2>
              <p className="text-xs text-brand-ink-3">
                {nextStep.type} · курс «{activeCourse.title}»
              </p>
            </div>

            <Link
              href={`/student/course/${activeCourse.id}/step/${nextStep.id}?studentId=${currentStudent.id}`}
              className="mt-8 z-10 w-full h-14 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-lg rounded-[14px] flex items-center justify-center transition shadow-lg"
            >
              Продолжить →
            </Link>
          </div>
        )}

        {/* РАСШИФРОВКА РЕЙТИНГА */}
        <div className="bg-white border border-brand-line rounded-card p-8 shadow-sm space-y-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-5xl font-black text-brand-ink tracking-tight font-mono">
                {totalPoints}
              </div>
              <div className="text-xs text-brand-ink-2 mt-1">Очки в региональном рейтинге</div>
            </div>
            <span className="text-xs bg-st-done-bg text-st-done font-bold px-3 py-1 rounded-pill">
              Активен
            </span>
          </div>

          <div className="w-full h-3 bg-brand-line rounded-pill overflow-hidden flex">
            <div className="bg-brand-blue h-full" style={{ width: "60%" }} />
            <div className="bg-brand-sky h-full" style={{ width: "25%" }} />
            <div className="bg-brand-amber h-full" style={{ width: "15%" }} />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-ink-2">Автопроверка тестов</span>
              <span className="font-mono font-bold">{Math.round(totalPoints * 0.6)} б.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-ink-2">Проверка куратором</span>
              <span className="font-mono font-bold">{Math.round(totalPoints * 0.25)} б.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-ink-2">Бонус за регулярность</span>
              <span className="font-mono font-bold">{Math.round(totalPoints * 0.15)} б.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}