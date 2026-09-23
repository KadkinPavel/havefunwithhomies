import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const courses = await prisma.course.findMany({
    include: { steps: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
            Контур методиста
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mt-1">
            Управление образовательными курсами
          </h1>
        </div>

        <Link
          href="/admin/course/new"
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          + Создать новый курс
        </Link>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:border-zinc-300 transition"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded">
                  {course.gradeRange}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {course.steps.length} шагов
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-950 mt-1.5">{course.title}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{course.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/admin/course/${course.id}/edit`}
                className="text-xs font-semibold border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 px-4 py-2 rounded-xl transition"
              >
                Редактировать шаги ⚙
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}