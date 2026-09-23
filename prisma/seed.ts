import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.submission.deleteMany();
  await prisma.step.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Создаем куратора и методиста
  const curator = await prisma.user.create({
    data: {
      id: "curator_elena",
      name: "Елена Николаева (Куратор ФСП)",
      email: "curator@fsp21.ru",
      role: "CURATOR"
    }
  });

  const admin = await prisma.user.create({
    data: {
      id: "admin_fsp",
      name: "Оргкомитет Чемпионата Чувашии",
      email: "admin@fsp21.ru",
      role: "ADMIN"
    }
  });

  // Ученики
  const student1 = await prisma.user.create({
    data: {
      id: "student_ivan",
      name: "Иван Васильев (5 класс, Лицей №3 Чебоксары)",
      email: "ivan@example.ru",
      role: "STUDENT",
      curatorId: curator.id,
      lastActiveAt: new Date()
    }
  });

  const student2 = await prisma.user.create({
    data: {
      id: "student_anna",
      name: "Анна Павлова (3 класс, СОШ №59 Чебоксары)",
      email: "anna@example.ru",
      role: "STUDENT",
      curatorId: curator.id,
      // Эмулируем задержку активности для демонстрации Early Warning алертов
      lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  // Курс 1: Алгоритмика для 5-9 классов
  const courseAlgo = await prisma.course.create({
    data: {
      title: "Спортивное программирование: Базовый олимпиадный трек",
      gradeRange: "5-9 класс",
      description: "Подготовка к региональному этапу. Линейные алгоритмы и условные операторы.",
      published: true,
      steps: {
        create: [
          {
            title: "Задача A: Сумма двух чисел",
            order: 1,
            type: "CODE",
            maxScore: 100,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              task: "Напишите функцию solve(input), которая принимает строку из двух чисел через пробел и возвращает их сумму.",
              starterCode: "function solve(input) {\n  const [a, b] = input.split(' ').map(Number);\n  return a + b;\n}",
              testCases: [
                { input: "2 3", expectedOutput: "5" },
                { input: "100 250", expectedOutput: "350" },
                { input: "-10 10", expectedOutput: "0" }
              ]
            })
          },
          {
            title: "Контрольный вопрос: Сложность алгоритма",
            order: 2,
            type: "QUIZ",
            maxScore: 20,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              question: "Какова асимптотическая сложность бинарного поиска в отсортированном массиве?",
              options: ["O(N)", "O(log N)", "O(N^2)", "O(1)"],
              correctIndex: 1
            })
          }
        ]
      }
    }
  });

  // Курс 2: Начальное программирование (Scratch + Minecraft)
  const courseJunior = await prisma.course.create({
    data: {
      title: "Визуальное олимпиадное программирование: Scratch и Minecraft",
      gradeRange: "1-4 класс",
      description: "Изучение алгоритмических конструкций через блочные среды для младших школьников.",
      published: true,
      steps: {
        create: [
          {
            title: "Проект Scratch: Лабиринт спрайта",
            order: 1,
            type: "SCRATCH",
            maxScore: 50,
            isAutoCheck: false,
            payloadJson: JSON.stringify({
              task: "Создайте программу, в которой персонаж проходит лабиринт, не касаясь черных стен, используя блоки событий и сенсоров."
            })
          },
          {
            title: "Minecraft Education: Агент-строитель",
            order: 2,
            type: "MINECRAFT",
            maxScore: 50,
            isAutoCheck: false,
            payloadJson: JSON.stringify({
              task: "Запрограммируйте агента в MakeCode построить башню 5x5 блоков высотой 10 блоков с использованием цикла."
            })
          }
        ]
      }
    }
  });

  // Демонстрационная работа в очереди куратора
  const scratchStep = await prisma.step.findFirst({ where: { type: "SCRATCH" } });
  if (scratchStep) {
    await prisma.submission.create({
      data: {
        studentId: student1.id,
        stepId: scratchStep.id,
        content: "https://scratch.mit.edu/projects/987654321/ (Реализовал управление через стрелки и проверку касания)",
        status: "PENDING",
        score: 0,
        attempts: 1
      }
    });
  }

  console.log("Данные успешно инициализированы!");
}

main().catch(console.error).finally(() => prisma.$disconnect());