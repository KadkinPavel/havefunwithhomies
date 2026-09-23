import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const courses = await prisma.course.findMany({ include: { steps: true } });
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление курсами</h1>
        <Link href="/admin/course/new" className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
          + Создать новый курс
        </Link>
      </div>
      <div className="space-y-4">
        {courses.map(c => (
          <div key={c.id} className="p-4 bg-white border rounded-xl flex justify-between items-center">
            <div>
              <h3 className="font-bold">{c.title} ({c.gradeRange})</h3>
              <p className="text-xs text-slate-500">Шагов: {c.steps.length}</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Опубликован</span>
          </div>
        ))}
      </div>
    </div>
  );
}