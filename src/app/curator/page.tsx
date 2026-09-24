import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReviewActionForm from "./ReviewActionForm";

export default async function CuratorDashboard({
  searchParams,
}: {
  searchParams: { curatorId?: string };
}) {
  const curators = await prisma.user.findMany({ where: { role: "CURATOR" } });
  const activeCurator =
    curators.find((c) => c.id === searchParams.curatorId) || curators[0];

  if (!activeCurator) return <div className="p-8 text-center text-xs">Кураторы не найдены</div>;

  // Очередь работ ТОЛЬКО закрепленных за этим куратором учеников
  const pendingSubmissions = await prisma.submission.findMany({
    where: {
      status: "PENDING",
      student: { curatorId: activeCurator.id },
    },
    include: {
      student: true,
      step: { include: { course: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6 role-staff">
      {/* Шапка и переключение между кураторами */}
      <div className="flex items-center justify-between border-b border-brand-line pb-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Очередь куратора</h1>
          <p className="text-xs text-brand-ink-2 mt-0.5">
            Куратор: <strong>{activeCurator.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-ink-3">Сменить куратора:</span>
          {curators.map((c) => (
            <Link
              key={c.id}
              href={`/curator?curatorId=${c.id}`}
              className={`px-3 py-1 rounded-btn text-xs font-medium transition ${
                c.id === activeCurator.id
                  ? "bg-brand-blue text-white"
                  : "bg-white border border-brand-line text-brand-ink-2 hover:bg-brand-blue-50"
              }`}
            >
              {c.name.split(" ")[0]}
            </Link>
          ))}
        </div>
      </div>

      {pendingSubmissions.length === 0 ? (
        <div className="bg-white border border-brand-line rounded-card p-12 text-center text-xs text-brand-ink-2">
          Очередь пуста. Все работы ваших закрепленных учеников проверены.
        </div>
      ) : (
        <div className="bg-white border border-brand-line rounded-card overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-mist border-b border-brand-line text-[11px] font-mono text-brand-ink-3 uppercase">
              <tr>
                <th className="py-3 px-6">Ученик</th>
                <th className="py-3 px-6">Шаг</th>
                <th className="py-3 px-6">Ждёт</th>
                <th className="py-3 px-6 text-right">Решение</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {pendingSubmissions.map((sub, idx) => (
                <tr key={sub.id} className="hover:bg-brand-mist/50 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-brand-ink text-sm">
                      {sub.student.name.split(" ")[0]} {sub.student.name.split(" ")[1]?.[0]}.
                    </div>
                    <span className="text-[11px] font-semibold text-st-done">
                      Закреплен за вами
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-semibold text-brand-ink text-sm">{sub.step.title}</div>
                    <div className="text-[11px] text-brand-ink-3">{sub.step.course.title}</div>
                    <div className="mt-2 p-2 bg-brand-mist rounded-field font-mono text-[11px] text-brand-ink break-all border border-brand-line">
                      {sub.content}
                    </div>
                  </td>

                  <td className="py-4 px-6 font-mono text-brand-ink-2 whitespace-nowrap">
                    {idx === 0 ? "1 д 3 ч" : "2 ч 40 м"}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <ReviewActionForm
                      submissionId={sub.id}
                      maxScore={sub.step.maxScore}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}