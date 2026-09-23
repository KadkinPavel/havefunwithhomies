import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { title, gradeRange, description, steps } = await req.json();

    const course = await prisma.course.create({
      data: {
        title,
        gradeRange,
        description,
        published: true,
        steps: {
          create: steps.map((s: any) => ({
            title: s.title,
            type: s.type,
            order: s.order,
            isAutoCheck: s.isAutoCheck,
            payloadJson: s.payloadJson
          }))
        }
      }
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}