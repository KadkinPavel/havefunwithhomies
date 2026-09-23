import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gradeQuiz, gradeAlgorithmicCode } from "@/lib/grader";

export async function POST(req: Request) {
  try {
    const { studentId, stepId, content } = await req.json();

    const step = await prisma.step.findUnique({ where: { id: stepId } });
    if (!step) return NextResponse.json({ error: "Шаг не найден" }, { status: 404 });

    // Обновляем активность ученика
    await prisma.user.update({
      where: { id: studentId },
      data: { lastActiveAt: new Date() }
    });

    let status = "PENDING";
    let score = 0;
    let feedback = null;

    if (step.isAutoCheck) {
      if (step.type === "QUIZ") {
        const res = gradeQuiz(step.payloadJson, content);
        status = res.pass ? "ACCEPTED" : "REJECTED";
        score = res.pass ? step.maxScore : 0;
        feedback = res.log;
      } else if (step.type === "CODE") {
        const res = gradeAlgorithmicCode(step.payloadJson, content);
        status = res.pass ? "ACCEPTED" : "REJECTED";
        score = Math.round((step.maxScore * res.scorePercent) / 100);
        feedback = res.log;
      }
    } else {
      // Ручная проверка для Scratch, Minecraft, проектных работ
      status = "PENDING";
      feedback = "Работа направлена в очередь куратору. Ожидайте рецензии.";
    }

    const prevSubmissionsCount = await prisma.submission.count({
      where: { studentId, stepId }
    });

    const submission = await prisma.submission.create({
      data: {
        studentId,
        stepId,
        content,
        status,
        score,
        feedback,
        attempts: prevSubmissionsCount + 1
      }
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}