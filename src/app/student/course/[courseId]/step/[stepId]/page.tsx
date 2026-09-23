import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StepInteractive from "./StepInteractive";

export default async function StepPlayerServerPage({
  params,
  searchParams,
}: {
  params: { courseId: string; stepId: string };
  searchParams: { studentId?: string };
}) {
  // Находим активного ученика
  const student = searchParams.studentId
    ? await prisma.user.findUnique({ where: { id: searchParams.studentId } })
    : await prisma.user.findFirst({ where: { role: "STUDENT" } });

  // Загружаем курс и его шаги напрямую из базы данных
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Курс не найден</h2>
        <Link
          href="/student"
          className="inline-block bg-zinc-900 text-white text-xs px-4 py-2 rounded-xl"
        >
          Вернуться к курсам
        </Link>
      </div>
    );
  }

  // Находим текущий шаг
  const currentStep =
    course.steps.find((s) => s.id === params.stepId) || course.steps[0];

  if (!currentStep) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">В курсе пока нет шагов</h2>
        <Link
          href="/student"
          className="inline-block bg-zinc-900 text-white text-xs px-4 py-2 rounded-xl"
        >
          Вернуться к курсам
        </Link>
      </div>
    );
  }

  // Загружаем последний ответ ученика на этот шаг (если есть)
  const initialSubmission = student
    ? await prisma.submission.findFirst({
        where: { stepId: currentStep.id, studentId: student.id },
        orderBy: { createdAt: "desc" },
      })
    : null;

  return (
    <StepInteractive
      course={course}
      currentStep={currentStep}
      studentId={student?.id || "student_ivan"}
      initialSubmission={initialSubmission}
    />
  );
}