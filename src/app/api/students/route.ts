import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fullName, grade, school, email, preferredTrack } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json({ error: "Заполните имя и email" }, { status: 400 });
    }

    // 1. Ищем всех доступных кураторов
    let curators = await prisma.user.findMany({
      where: { role: "CURATOR" },
      include: { students: true },
    });

    // Если кураторов ещё нет — создаем троих под разные направления
    if (curators.length === 0) {
      const c1 = await prisma.user.create({
        data: { id: "curator_anna", name: "Анна Сергеевна (Куратор · Scratch)", email: "anna.curator@fsp21.ru", role: "CURATOR" }
      });
      const c2 = await prisma.user.create({
        data: { id: "curator_dmitry", name: "Дмитрий Алексеев (Куратор · Minecraft)", email: "dmitry.curator@fsp21.ru", role: "CURATOR" }
      });
      const c3 = await prisma.user.create({
        data: { id: "curator_elena", name: "Елена Николаева (Куратор · Python)", email: "elena.curator@fsp21.ru", role: "CURATOR" }
      });
      curators = [c1 as any, c2 as any, c3 as any];
    }

    // 2. Требование №2: Прикрепляем к наименее загруженному куратору (балансировка)
    // Либо по выбранному треку
    let assignedCurator = curators[0];
    if (preferredTrack === "scratch") {
      assignedCurator = curators.find(c => c.name.includes("Scratch")) || curators[0];
    } else if (preferredTrack === "minecraft") {
      assignedCurator = curators.find(c => c.name.includes("Minecraft")) || curators[1] || curators[0];
    } else if (preferredTrack === "python") {
      assignedCurator = curators.find(c => c.name.includes("Python")) || curators[2] || curators[0];
    } else {
      // Иначе к тому, у кого меньше всего закрепленных учеников
      curators.sort((a, b) => (a.students?.length || 0) - (b.students?.length || 0));
      assignedCurator = curators[0];
    }

    // 3. Создаем ученика
    const formattedName = `${fullName} (${grade} класс, ${school || "г. Чебоксары"})`;
    const student = await prisma.user.create({
      data: {
        name: formattedName,
        email: email.toLowerCase().trim(),
        role: "STUDENT",
        curatorId: assignedCurator.id,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, student, curatorName: assignedCurator.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}