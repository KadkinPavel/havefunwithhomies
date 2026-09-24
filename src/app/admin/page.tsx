import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const curators = await prisma.user.findMany({
    where: { role: "CURATOR" },
    include: {
      students: {
        include: {
          submissions: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const courses = await prisma.course.findMany({
    include: { steps: true },
    orderBy: { createdAt: "asc" },
  });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      curator: true,
      submissions: {
        include: {
          step: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const curatorStats = curators.map((c) => {
    let pendingCount = 0;
    let reviewedCount = 0;

    c.students.forEach((st) => {
      st.submissions.forEach((sub) => {
        if (sub.status === "PENDING") pendingCount++;
        if (sub.status === "ACCEPTED" || sub.status === "REJECTED") reviewedCount++;
      });
    });

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      studentsCount: c.students.length,
      pendingCount,
      reviewedCount,
      studentsList: c.students.map((st) => ({
        id: st.id,
        name: st.name,
        lastActiveAt: st.lastActiveAt,
      })),
    };
  });

  const studentStats = students.map((st) => {
    const totalScore = st.submissions
      .filter((sub) => sub.status === "ACCEPTED")
      .reduce((acc, sub) => acc + sub.score, 0);

    const courseProgress = courses.map((course) => {
      const courseStepIds = new Set(course.steps.map((s) => s.id));
      const passedSteps = new Set(
        st.submissions
          .filter((sub) => sub.status === "ACCEPTED" && courseStepIds.has(sub.stepId))
          .map((sub) => sub.stepId)
      );

      const percent = course.steps.length > 0 
        ? Math.round((passedSteps.size / course.steps.length) * 100) 
        : 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        passed: passedSteps.size,
        total: course.steps.length,
        percent,
      };
    });

    const hoursInactive = (Date.now() - new Date(st.lastActiveAt).getTime()) / (1000 * 60 * 60);
    let statusText = "В графике";
    let statusColor = "st-done";
    if (hoursInactive > 48) {
      statusText = "Выпадает";
      statusColor = "st-failed";
    } else if (hoursInactive > 24) {
      statusText = "Замедлился";
      statusColor = "brand-amber";
    }

    return {
      id: st.id,
      name: st.name,
      email: st.email,
      curatorId: st.curatorId,
      curatorName: st.curator?.name || "Не назначен",
      totalScore,
      statusText,
      statusColor,
      lastActiveAt: st.lastActiveAt,
      courseProgress,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 role-staff space-y-8">
      <AdminDashboardClient
        curators={curatorStats}
        rawCurators={curators.map((c) => ({ id: c.id, name: c.name }))}
        students={studentStats}
        courses={courses}
      />
    </div>
  );
}