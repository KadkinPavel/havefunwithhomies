import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fullName, grade, school, email } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 });
    }

    // Проверяем наличие куратора, если нет — создаем дефолтного куратора ФСП
    let curator = await prisma.user.findFirst({ where: { role: "CURATOR" } });
    if (!curator) {
      curator = await prisma.user.create({
        data: {
          id: "curator_elena",
          name: "Елена Николаева (Куратор ФСП)",
          email: "curator@fsp21.ru",
          role: "CURATOR",
        },
      });
    }

    // Проверяем, есть ли уже хотя бы один курс, если нет — создаем базовый олимпиадный курс
    const coursesCount = await prisma.course.count();
    if (coursesCount === 0) {
      await prisma.course.create({
        data: {
          title: "Основы спортивного программирования",
          gradeRange: `${grade} класс`,
          description: "Базовый алгоритмический трек: линейные алгоритмы и логические конструкции.",
          published: true,
          steps: {
            create: [
              {
                title: "Контрольный вопрос: Что такое алгоритм?",
                order: 1,
                type: "QUIZ",
                maxScore: 20,
                isAutoCheck: true,
                payloadJson: JSON.stringify({
                  question: "Что из перечисленного является точным определением алгоритма?",
                  options: [
                    "Последовательность команд, приводящая к решению задачи за конечное число шагов",
                    "Любая программа, написанная на языке Python",
                    "Компьютерная игра с открытым кодом"
                  ],
                  correctIndex: 0
                })
              },
              {
                title: "Практикум в Scratch: Первые шаги",
                order: 2,
                type: "SCRATCH",
                maxScore: 50,
                isAutoCheck: false,
                payloadJson: JSON.stringify({
                  task: "Создайте спрайт, который движется при нажатии на стрелки клавиатуры. Пришлите ссылку на проект."
                })
              }
            ]
          }
        }
      });
    }

    // Создаем ученика
    const formattedName = `${fullName} (${grade} класс, ${school || "г. Чебоксары"})`;
    const student = await prisma.user.create({
      data: {
        name: formattedName,
        email: email.toLowerCase().trim(),
        role: "STUDENT",
        curatorId: curator.id,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}