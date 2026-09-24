import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Очистка базы данных...");
  await prisma.submission.deleteMany();
  await prisma.step.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  console.log("Создание кураторов и учеников...");
  const curatorAnna = await prisma.user.create({
    data: {
      id: "curator_anna",
      name: "Анна Сергеевна (Куратор · Scratch)",
      email: "anna@fsp21.ru",
      role: "CURATOR",
    },
  });

  const curatorDmitry = await prisma.user.create({
    data: {
      id: "curator_dmitry",
      name: "Дмитрий Алексеев (Куратор · Minecraft)",
      email: "dmitry@fsp21.ru",
      role: "CURATOR",
    },
  });

  const curatorElena = await prisma.user.create({
    data: {
      id: "curator_elena",
      name: "Елена Николаева (Куратор · Python)",
      email: "elena@fsp21.ru",
      role: "CURATOR",
    },
  });

  await prisma.user.create({
    data: {
      id: "admin_fsp",
      name: "Оргкомитет Чемпионата Чувашии",
      email: "admin@fsp21.ru",
      role: "ADMIN",
    },
  });

  const masha = await prisma.user.create({
    data: {
      id: "student_masha",
      name: "Маша К. (4 класс, Лицей №3)",
      email: "masha@fsp21.ru",
      role: "STUDENT",
      curatorId: curatorAnna.id,
      lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  const ivan = await prisma.user.create({
    data: {
      id: "student_ivan",
      name: "Иван П. (5 класс, СОШ №59)",
      email: "ivan@fsp21.ru",
      role: "STUDENT",
      curatorId: curatorElena.id,
      lastActiveAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  const timur = await prisma.user.create({
    data: {
      id: "student_timur",
      name: "Тимур А. (3 класс, Гимназия №5)",
      email: "timur@fsp21.ru",
      role: "STUDENT",
      curatorId: curatorDmitry.id,
      lastActiveAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    },
  });

  console.log("Загрузка Курса 1: Scratch...");
  await prisma.course.create({
    data: {
      id: "course_scratch",
      title: "Первые программы в Scratch",
      gradeRange: "2–4 класс",
      description: "Сборка программ из блоков, понимание циклов, событий и условий.",
      published: true,
      steps: {
        create: [
          {
            title: "Шаг 1.1.1. Сцена, спрайты и блоки",
            order: 1,
            type: "THEORY",
            maxScore: 10,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              text: "Scratch — это среда, в которой программы собирают из цветных блоков, как из конструктора. Сцена — прямоугольник справа вверху. Спрайт — персонаж на сцене. Центр сцены — x: 0, y: 0. Левый край — x: -240, правый — x: 240.",
            }),
          },
          {
            title: "Шаг 1.1.2. Проверь себя: окно Scratch",
            order: 2,
            type: "QUIZ",
            maxScore: 10,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              question: "Где в Scratch происходит всё, что делает программа?",
              options: ["В палитре блоков", "На сцене", "В области скриптов", "В меню «Файл»"],
              correctIndex: 1,
            }),
          },
          {
            title: "Шаг 1.1.3. Разбор: мяч летит к центру",
            order: 3,
            type: "SCRATCH",
            maxScore: 20,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              task: "Посмотри на программу спрайта Мяч. Собери её у себя и запусти. Мяч начинает с x: -200 и делает 10 раз по 20 шагов вправо. Чему равен x мяча в конце?",
              correctNumeric: "0",
            }),
          },
          {
            title: "Шаг 1.2.1. Повторить и всегда",
            order: 4,
            type: "THEORY",
            maxScore: 10,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              text: "Цикл — блок, который повторяет вложенные команды несколько раз: повторить 10 раз или повторять всегда.",
            }),
          },
          {
            title: "Шаг 1.2.2. Проверь себя: сколько шагов",
            order: 5,
            type: "QUIZ",
            maxScore: 10,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              question: "Сколько всего шагов пройдёт спрайт: повторить (3) раз [идти 10 шагов; идти 5 шагов]?",
              correctNumeric: "45",
            }),
          },
          {
            title: "Шаг 1.2.4. Разбор: кот по кругу",
            order: 6,
            type: "SCRATCH",
            maxScore: 30,
            isAutoCheck: false,
            payloadJson: JSON.stringify({
              task: "Кот поворачивает на 3 градуса. Замените бесконечный цикл на ровно 1 круг (120 повторений) и фразу Круг!.",
              criteria: ["Цикл 120 раз", "Кот в начальной точке", "Говорит Круг!"],
            }),
          },
        ],
      },
    },
  });

  console.log("Загрузка Курса 3: Python...");
  await prisma.course.create({
    data: {
      id: "course_python",
      title: "Алгоритмика: первые задачи на Python",
      gradeRange: "5–9 класс",
      description: "Олимпиадные алгоритмы, чтение входных потоков и автоматическое тестирование решений.",
      published: true,
      steps: {
        create: [
          {
            title: "Шаг 3.1.1. Как устроена олимпиадная задача",
            order: 1,
            type: "THEORY",
            maxScore: 10,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              text: "В олимпиадном программировании решение читает входные данные через input() и выводит ТОЛЬКО ответ через print(). Никаких лишних слов.",
            }),
          },
          {
            title: "Шаг 3.1.2. Проверь себя: вывод ответа",
            order: 2,
            type: "QUIZ",
            maxScore: 10,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              question: "В задаче нужно вывести сумму двух чисел. Ответ — 7. Что должна напечатать программа?",
              options: ["Ответ: 7", "7", "сумма = 7", "7.0"],
              correctIndex: 1,
            }),
          },
          {
            title: "Шаг 3.1.3. Задача: сумма двух чисел",
            order: 3,
            type: "CODE",
            maxScore: 100,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              task: "Даны два целых числа a и b в одной строке через пробел. Выведите их сумму.",
              starterCode: "a, b = map(int, input().split())\\nprint(a + b)",
              testCases: [
                { num: "1", input: "2 3", expectedOutput: "5", visibility: "пример в условии" },
                { num: "2", input: "-5 7", expectedOutput: "2", visibility: "пример в условии" },
                { num: "3", input: "0 0", expectedOutput: "0", visibility: "скрытый" },
                { num: "4", input: "1000000000 1000000000", expectedOutput: "2000000000", visibility: "скрытый" },
              ],
            }),
          },
          {
            title: "Шаг 3.1.4. Задача: парты",
            order: 4,
            type: "CODE",
            maxScore: 100,
            isAutoCheck: true,
            payloadJson: JSON.stringify({
              task: "В школе 3 класса. За партой сидят двое. Дано число учеников в 3 строках. Найдите наименьшее число парт.",
              starterCode: "a = int(input())\\nb = int(input())\\nc = int(input())\\nprint((a + 1) // 2 + (b + 1) // 2 + (c + 1) // 2)",
              testCases: [
                { num: "1", input: "20\\n21\\n22", expectedOutput: "32", visibility: "пример в условии" },
                { num: "2", input: "1\\n1\\n1", expectedOutput: "3", visibility: "пример в условии" },
                { num: "3", input: "2\\n2\\n2", expectedOutput: "3", visibility: "скрытый" },
              ],
            }),
          },
        ],
      },
    },
  });

  const scratchStep = await prisma.step.findFirst({ where: { title: { contains: "кот по кругу" } } });
  if (scratchStep) {
    await prisma.submission.create({
      data: {
        studentId: masha.id,
        stepId: scratchStep.id,
        content: "https://scratch.mit.edu/projects/987654321/ (Кот проходит 120 раз и говорит Круг!)",
        status: "PENDING",
        score: 0,
        attempts: 1,
      },
    });
  }

  console.log("Официальный пакет материалов успешно импортирован!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());