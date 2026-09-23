import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ course });
}

export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const data = await req.json();
    const course = await prisma.course.update({
      where: { id: params.courseId },
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

export async function DELETE(req: Request, { params }: { params: { courseId: string } }) {
  try {
    await prisma.course.delete({ where: { id: params.courseId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}