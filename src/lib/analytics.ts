import { prisma } from "./prisma";

export async function getStudentRating(studentId: string) {
  const submissions = await prisma.submission.findMany({
    where: { studentId },
    include: { step: { include: { course: true } } },
    orderBy: { createdAt: "desc" }
  });

  const breakdown = submissions.map((s) => ({
    submissionId: s.id,
    courseTitle: s.step.course.title,
    stepTitle: s.step.title,
    stepType: s.step.type,
    method: s.step.isAutoCheck ? "Автоматическая проверка" : "Проверка куратором",
    score: s.score,
    maxScore: s.step.maxScore,
    status: s.status,
    date: s.createdAt.toLocaleDateString("ru-RU")
  }));

  const totalPoints = submissions
    .filter((s) => s.status === "ACCEPTED")
    .reduce((acc, curr) => acc + curr.score, 0);

  return { totalPoints, breakdown };
}

// Раннее предупреждение (раньше, чем ученик перестанет заходить)
export async function getCuratorAlerts(curatorId: string) {
  const students = await prisma.user.findMany({
    where: { curatorId },
    include: {
      submissions: {
        include: { step: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const alerts: { studentId: string; studentName: string; reason: string; severity: "HIGH" | "MEDIUM" }[] = [];

  const now = new Date().getTime();

  for (const st of students) {
    // 1. Критерий неактивности более 2 дней
    const hoursInactive = (now - new Date(st.lastActiveAt).getTime()) / (1000 * 60 * 60);
    if (hoursInactive > 48) {
      alerts.push({
        studentId: st.id,
        studentName: st.name,
        reason: `Не заходил на платформу ${Math.floor(hoursInactive / 24)} дн.`,
        severity: "HIGH"
      });
      continue;
    }

    // 2. Критерий "застревания" на конкретном шаге (> 2 неудачных попыток подряд)
    const recentSubmissions = st.submissions.slice(0, 5);
    const rejectedOnSameStep = recentSubmissions.filter(
      (s) => s.status === "REJECTED" && s.stepId === recentSubmissions[0]?.stepId
    );

    if (rejectedOnSameStep.length >= 3) {
      alerts.push({
        studentId: st.id,
        studentName: st.name,
        reason: `Застрял на шаге "${rejectedOnSameStep[0].step.title}" (${rejectedOnSameStep.length} ошибок подряд)`,
        severity: "HIGH"
      });
    }
  }

  return alerts;
}