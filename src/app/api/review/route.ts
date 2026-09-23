import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { submissionId, status, score, feedback } = await req.json();

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status, // ACCEPTED или REJECTED
        score: parseInt(score, 10) || 0,
        feedback,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}