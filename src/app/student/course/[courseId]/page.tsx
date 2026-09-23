import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { studentId?: string };
}) {
  const student = searchParams.studentId
    ? await prisma.user.findUnique({ where: { id: searchParams.studentId } })
    : await prisma.user.findFirst({ where: { role: "STUDENT" } });

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: {
          submissions: {
            where: { studentId: student?.id || "" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!course) notFound();

  // Расчет прогресса
  const completedSteps = course.steps.filter(
    (s) => s.submissions[0]?.status === "ACCEPTED"
  );
  const progressPercent = Math.round(
    (completedSteps.length / (course.steps.length || 1)) * 100
  );

  // Определение следующего шага
  const nextStep =
    course.steps.find((s) => s.submissions[0]?.status !== "ACCEPTED") ||
    course.steps[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Хлебные крошки */}
      <Link
        href="/student"
        className="text-xs font-medium text-zinc-400 hover:text-zinc-900 transition flex items-center gap-1.5"
      >
        ← Вернуться ко всем курсам
      </Link>

      {/* Карточка курса и прогресс */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md">
              {course.gradeRange}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mt-2">
              {course.title}
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-xl leading-relaxed">
              {course.description}
            </p>
          </div>

          {nextStep && (
            <Link
              href={`/student/course/${course.id}/step/${nextStep.id}`}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-6 py-3 rounded-xl transition shadow-sm text-center whitespace-nowrap"
            >
              {completedSteps.length === 0 ? "Начать курс →" : "Следующий шаг →"}
            </Link>
          )}
        </div>

        {/* Прогресс-бар */}
        <div className="pt-4 border-t border-zinc-100 space-y-2">
          <div className="flex justify-between text-xs font-mono text-zinc-500">
            <span>Прогресс прохождения</span>
            <span>
              {completedSteps.length} из {course.steps.length} шагов ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Программа курса (Шаги) */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-950">Содержание программы</h2>

        <div className="space-y-2.5">
          {course.steps.map((step, index) => {
            const lastSub = step.submissions[0];
            const isCompleted = lastSub?.status === "ACCEPTED";
            const isPending = lastSub?.status === "PENDING";
            const isRejected = lastSub?.status === "REJECTED";

            return (
              <Link
                key={step.id}
                href={`/student/course/${course.id}/step/${step.id}`}
                className="group bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : isPending
                        ? "bg-amber-100 text-amber-800"
                        : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">
                        {step.type}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        до {step.maxScore} б.
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-0.5 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isPending
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isRejected
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "text-zinc-400"
                    }`}
                  >
                    {isCompleted
                      ? "Зачтено"
                      : isPending
                      ? "На проверке"
                      : isRejected
                      ? "Доработка"
                      : "Не начат"}
                  </span>
                  <span className="text-zinc-300 group-hover:translate-x-1 transition-transform text-sm">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}