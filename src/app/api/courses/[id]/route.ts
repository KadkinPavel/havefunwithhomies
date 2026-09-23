import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Получение курса по его ID вместе со всеми шагами
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json({ error: "ID курса не указан" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        steps: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Обновление курса (редактирование методистом)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        gradeRange: data.gradeRange,
        published: data.published,
      },
    });
    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Удаление курса
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}