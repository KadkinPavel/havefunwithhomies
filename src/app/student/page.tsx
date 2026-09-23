import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStudentRating } from "@/lib/analytics";
import RegisterForm from "./RegisterForm";

export default async function StudentPage({
  searchParams,
}: {
  searchParams: { studentId?: string; view?: string };
}) {
  const allStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
  });

  // Если учеников вообще нет или запрошена форма создания нового
  if (allStudents.length === 0 || searchParams.view === "register") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <RegisterForm />
      </div>
    );
  }

  // Выбираем активного ученика (по ID из URL или берем первого)
  const currentStudent =
    allStudents.find((s) => s.id === searchParams.studentId) || allStudents[0];

  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  const { totalPoints, breakdown } = await getStudentRating(currentStudent.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Верхний бар с переключением спортсменов для жюри */}
      <div className="flex items-center justify-between bg-zinc-100/70 border border-zinc-200/60 px-4 py-2.5 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-mono">Спортсмен:</span>
          <span className="font-semibold text-zinc-900">{currentStudent.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {allStudents.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[11px]">Сменить:</span>
              {allStudents.map((s) => (
                <Link
                  key={s.id}
                  href={`/student?studentId=${s.id}`}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    s.id === currentStudent.id
                      ? "bg-zinc-900 text-white font-bold"
                      : "bg-white text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {s.name.split(" ")[0]}
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/student?view=register"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            + Зарегистрировать еще
          </Link>
        </div>
      </div>

      {/* Профиль и прозрачный рейтинг */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-zinc-200/80 p-8 rounded-3xl shadow-sm">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            Личный кабинет спортсмена
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mt-1">
            {currentStudent.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Федерация спортивного программирования Чувашии
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl px-6 py-4 flex items-baseline gap-4 min-w-[200px]">
          <div>
            <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
              Общий рейтинг
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-zinc-950">
              {totalPoints} <span className="text-sm font-normal text-zinc-400">баллов</span>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full ml-auto">
            Активен
          </span>
        </div>
      </div>

      {/* Сетка курсов */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-zinc-950">Мои учебные программы</h2>
          <span className="text-xs text-zinc-400 font-mono">Доступно: {courses.length}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((course) => {
            const firstStep = course.steps[0];
            return (
              <div
                key={course.id}
                className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-md">
                      {course.gradeRange}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {course.steps.length} шагов
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-zinc-950 mt-3">
                    {course.title}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="text-xs text-zinc-400 font-mono">Спортивный трек</div>
                  {firstStep ? (
                    <Link
                      href={`/student/course/${course.id}/step/${firstStep.id}`}
                      className="text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl transition"
                    >
                      Начать задание →
                    </Link>
                  ) : (
                    <span className="text-xs text-zinc-400">В разработке</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Таблица объяснимого рейтинга */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-zinc-950">Прозрачный расчет рейтинга</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Детализация каждого балла (ручная проверка куратора и автоматические тесты)
          </p>
        </div>

        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/75 border-b border-zinc-200/80 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Задание</th>
                <th className="py-3.5 px-5">Среда</th>
                <th className="py-3.5 px-5">Метод оценки</th>
                <th className="py-3.5 px-5">Статус</th>
                <th className="py-3.5 px-5 text-right">Начислено</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 text-sm">
                    Выполненные задания пока отсутствуют
                  </td>
                </tr>
              ) : (
                breakdown.map((item) => (
                  <tr key={item.submissionId} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-medium text-zinc-900">{item.stepTitle}</div>
                      <div className="text-xs text-zinc-400">{item.courseTitle}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-xs font-mono font-medium px-2 py-0.5 bg-zinc-100 rounded text-zinc-600">
                        {item.stepType}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-zinc-500">{item.method}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          item.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : item.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-amber-50 text-amber-700 border border-amber-200/60"
                        }`}
                      >
                        {item.status === "ACCEPTED"
                          ? "Зачтено"
                          : item.status === "REJECTED"
                          ? "Доработка"
                          : "На проверке"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-semibold text-zinc-950">
                      +{item.score} / {item.maxScore}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}