import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Создание нового куратора или ученика
export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (data.type === "CURATOR") {
      const { name, email, specialization } = data;
      if (!name || !email) return NextResponse.json({ error: "Заполните имя и email" }, { status: 400 });

      const curator = await prisma.user.create({
        data: {
          name: `${name} (Куратор · ${specialization || "ФСП"})`,
          email: email.toLowerCase().trim(),
          role: "CURATOR",
        },
      });
      return NextResponse.json({ success: true, user: curator });
    }

    if (data.type === "STUDENT") {
      const { fullName, grade, school, email, curatorId } = data;
      if (!fullName || !email) return NextResponse.json({ error: "Заполните имя и email" }, { status: 400 });

      // Если куратор не выбран — берем первого доступного
      let targetCuratorId = curatorId;
      if (!targetCuratorId) {
        const firstCurator = await prisma.user.findFirst({ where: { role: "CURATOR" } });
        targetCuratorId = firstCurator?.id;
      }

      const formattedName = `${fullName} (${grade} класс, ${school || "г. Чебоксары"})`;
      const student = await prisma.user.create({
        data: {
          name: formattedName,
          email: email.toLowerCase().trim(),
          role: "STUDENT",
          curatorId: targetCuratorId,
          lastActiveAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, user: student });
    }

    return NextResponse.json({ error: "Неверный тип пользователя" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Смена закрепленного куратора у ученика
export async function PATCH(req: Request) {
  try {
    const { studentId, newCuratorId } = await req.json();
    const updated = await prisma.user.update({
      where: { id: studentId },
      data: { curatorId: newCuratorId },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}