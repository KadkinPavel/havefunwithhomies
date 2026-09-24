import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CourseEditorClient from "./CourseEditorClient";

export default async function CourseEditServerPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!course) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 role-staff">
      <Link href="/admin" className="text-xs text-brand-ink-3 hover:text-brand-ink transition">
        ← Вернуться к списку программ
      </Link>

      <div className="bg-white border border-brand-line rounded-card p-6 shadow-sm space-y-2">
        <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-brand-blue-50 text-brand-blue rounded">
          {course.gradeRange}
        </span>
        <h1 className="text-2xl font-bold text-brand-ink">{course.title}</h1>
        <p className="text-xs text-brand-ink-2">{course.description}</p>
      </div>

      <CourseEditorClient course={course} />
    </div>
  );
}