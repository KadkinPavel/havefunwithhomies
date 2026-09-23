import { prisma } from "@/lib/prisma";
import { getCuratorAlerts } from "@/lib/analytics";
import ReviewActionForm from "./ReviewActionForm";

export default async function CuratorDashboard() {
  const curator = await prisma.user.findFirst({ where: { role: "CURATOR" } });
  if (!curator) return <div className="p-8 text-center text-zinc-500">Куратор не найден</div>;

  const pendingSubmissions = await prisma.submission.findMany({
    where: { status: "PENDING" },
    include: {
      student: true,
      step: { include: { course: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const alerts = await getCuratorAlerts(curator.id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* Шапка куратора */}
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
          Контур сопровождения
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 mt-1">
          Куратор: {curator.name}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Федерация спортивного программирования Чувашской Республики
        </p>
      </div>

      {/* Early Warning System (Критерий 06, п.4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-base font-semibold text-zinc-950">
              Раннее предупреждение отставания (Early Warning)
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {alerts.length} предупреждений
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl text-xs text-zinc-500">
            ✓ Все закрепленные спортсмены соблюдают динамику прохождения.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-zinc-950 text-xs">{alert.studentName}</div>
                  <div className="text-xs text-rose-700 mt-1">{alert.reason}</div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Очередь ручной проверки */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950">
            Очередь работ на ручную проверку ({pendingSubmissions.length})
          </h2>
          <span className="text-xs text-zinc-400 font-mono">Scratch · Minecraft · Проекты</span>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center text-zinc-400 text-xs">
            Очередь пуста. Все присланные работы проверены.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        {sub.step.type}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        Попытка #{sub.attempts}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 mt-1.5 text-sm">
                      {sub.step.title}
                    </h3>
                    <p className="text-xs text-zinc-500">{sub.step.course.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-900 block">
                      {sub.student.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {sub.createdAt.toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl font-mono text-xs text-zinc-800 break-all">
                  {sub.content}
                </div>

                <ReviewActionForm submissionId={sub.id} maxScore={sub.step.maxScore} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}