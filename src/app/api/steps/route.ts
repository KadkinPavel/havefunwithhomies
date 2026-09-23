import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { courseId, title, type, maxScore, isAutoCheck, payloadJson } = await req.json();

    const lastStep = await prisma.step.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const step = await prisma.step.create({
      data: {
        courseId,
        title,
        type,
        order: (lastStep?.order || 0) + 1,
        maxScore: parseInt(maxScore, 10) || 10,
        isAutoCheck: Boolean(isAutoCheck),
        payloadJson: typeof payloadJson === "string" ? payloadJson : JSON.stringify(payloadJson),
      },
    });

    return NextResponse.json({ success: true, step });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stepId = searchParams.get("stepId");
    if (!stepId) return NextResponse.json({ error: "stepId required" }, { status: 400 });

    await prisma.step.delete({ where: { id: stepId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}