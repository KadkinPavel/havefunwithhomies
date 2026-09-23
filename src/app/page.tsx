import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [coursesCount, studentsCount, pendingCount] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.submission.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-16 pb-12">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Региональный стандарт подготовки с 2027 г.
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950">
          Спортивное программирование для школьников
        </h1>

        <p className="text-zinc-500 text-base leading-relaxed">
          Самостоятельное обучение учащихся 1–9 классов с интеллектуальным сопровождением кураторов и гибкой архитектурой заданий.
        </p>
      </div>

      {/* Ролевые карточки (Three Loops) */}
      <div className="grid md:grid-cols-3 gap-5 mb-16">
        {/* Контур 1: Ученик */}
        <Link
          href="/student"
          className="group relative bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-5 group-hover:scale-105 transition-transform">
              01
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
              Контур Ученика
            </h2>
            <p className="text-sm text-zinc-500 mt-2 leading-normal">
              Курсы по алгоритмике, Scratch и Minecraft. Наглядный прогресс и объяснимый рейтинг баллов.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
            <span>Войти в кабинет</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Контур 2: Куратор */}
        <Link
          href="/curator"
          className="group relative bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm mb-5 group-hover:scale-105 transition-transform">
              02
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                Контур Куратора
              </h2>
              {pendingCount > 0 && (
                <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  +{pendingCount}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-2 leading-normal">
              Очередь ручной проверки и система раннего выявления застрявших учеников (Early Warning).
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
            <span>Очередь проверки</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Контур 3: Администратор */}
        <Link
          href="/admin"
          className="group relative bg-white border border-zinc-200/80 rounded-2xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mb-5 group-hover:scale-105 transition-transform">
              03
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-purple-600 transition-colors">
              Контур Методиста
            </h2>
            <p className="text-sm text-zinc-500 mt-2 leading-normal">
              Конструктор курсов из модулей: Scratch, Minecraft Education, тесты и алгоритмические контесты.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-900">
            <span>Управление курсами</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>

      {/* Быстрая статистика платформы */}
      <div className="bg-zinc-900 text-white rounded-2xl p-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Метрики платформы
          </span>
          <h3 className="text-xl font-medium mt-1">Готовность к масштабированию региона</h3>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight">{coursesCount}</div>
            <div className="text-xs text-zinc-400 mt-0.5">Курса в базе</div>
          </div>
          <div className="w-[1px] bg-zinc-800 h-10" />
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight">{studentsCount}</div>
            <div className="text-xs text-zinc-400 mt-0.5">Спортсмена 1–9 кл.</div>
          </div>
          <div className="w-[1px] bg-zinc-800 h-10" />
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-amber-400">
              {pendingCount}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">На проверке</div>
          </div>
        </div>
      </div>
    </div>
  );
}