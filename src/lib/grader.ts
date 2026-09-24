import { spawnSync } from "child_process";

export interface TestCase {
  num: string;
  input: string;
  expectedOutput: string;
  visibility?: string;
}

// Проверка тестов и числовых ответов (тон: коротко, дружелюбно, как тренер)
export function gradeQuizOrNumeric(payloadJson: string, answer: string): { pass: boolean; scorePercent: number; log: string } {
  try {
    const payload = typeof payloadJson === "string" ? JSON.parse(payloadJson) : payloadJson;
    const cleanAnswer = String(answer).trim();

    // 1. Числовой ответ (Scratch или тест)
    if (payload.correctNumeric !== undefined && payload.correctNumeric !== null) {
      const expected = String(payload.correctNumeric).trim();
      const pass = cleanAnswer === expected;
      return {
        pass,
        scorePercent: pass ? 100 : 0,
        log: pass 
          ? `Верно! Ответ ${expected}.` 
          : `Не сходится. Твой ответ: ${cleanAnswer}. Пересчитай шаги ещё раз.`
      };
    }

    // 2. Одиночный выбор
    if (payload.correctIndex !== undefined) {
      const chosen = parseInt(cleanAnswer, 10);
      const pass = chosen === payload.correctIndex;
      return {
        pass,
        scorePercent: pass ? 100 : 0,
        log: pass ? "В точку! Задание зачтено." : "Пока не так. Перечитай теорию шага и попробуй снова."
      };
    }

    // 3. Множественный выбор
    if (payload.correctIndices && Array.isArray(payload.correctIndices)) {
      const chosen = cleanAnswer.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)).sort();
      const expected = [...payload.correctIndices].sort();
      const pass = chosen.length === expected.length && chosen.every((v, i) => v === expected[i]);
      return {
        pass,
        scorePercent: pass ? 100 : 0,
        log: pass ? "Отлично! Все верные варианты на месте." : "Выбраны не все варианты или попался лишний."
      };
    }

    return { pass: true, scorePercent: 100, log: "Ответ принят." };
  } catch (err: any) {
    return { pass: false, scorePercent: 0, log: "Ошибка проверки: " + err.message };
  }
}

// Запуск кода на Python 3 по олимпиадным тестам
export function gradePythonCode(payloadJson: string, userCode: string, timeLimitMs = 2000): { pass: boolean; scorePercent: number; log: string } {
  try {
    const payload = typeof payloadJson === "string" ? JSON.parse(payloadJson) : payloadJson;
    const testCases: TestCase[] = payload.testCases || [];

    if (testCases.length === 0) {
      return { pass: true, scorePercent: 100, log: "Код принят." };
    }

    let passedCount = 0;
    const logs: string[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const isHidden = tc.visibility === "скрытый";
      const label = `Тест ${tc.num || i + 1}${isHidden ? " (скрытый)" : " (пример)"}`;

      try {
        const proc = spawnSync("python3", ["-c", userCode], {
          input: tc.input + "\n",
          encoding: "utf-8",
          timeout: timeLimitMs,
          maxBuffer: 1024 * 1024,
        });

        if (proc.error) {
          if ((proc.error as any).code === "ETIMEDOUT") {
            logs.push(`${label}: Превышено время (Time Limit Exceeded)`);
          } else {
            logs.push(`${label}: Ошибка выполнения`);
          }
          continue;
        }

        if (proc.status !== 0) {
          const errLast = (proc.stderr || "Runtime Error").trim().split("\n").slice(-1)[0];
          logs.push(`${label}: Ошибка (${errLast})`);
          continue;
        }

        const actual = (proc.stdout || "").trim();
        const expected = (tc.expectedOutput || "").trim();

        if (actual === expected) {
          passedCount++;
          logs.push(`${label}: Пройден ✓`);
        } else {
          if (isHidden) {
            logs.push(`${label}: Неверный ответ`);
          } else {
            logs.push(`${label}: Не совпало. Ожидалось: "${expected}", выведено: "${actual}"`);
          }
        }
      } catch (err: any) {
        logs.push(`${label}: Сбой: ${err.message}`);
      }
    }

    const pass = passedCount === testCases.length;
    const scorePercent = Math.round((passedCount / testCases.length) * 100);

    // Тон по брендбуку: «Прошло 7 тестов из 10...»
    const summary = pass
      ? `Все ${testCases.length} тестов пройдены! Отличная работа.`
      : `Прошло ${passedCount} тестов из ${testCases.length}. Проверь краевые случаи.`;

    return {
      pass,
      scorePercent,
      log: `${summary}\n\n` + logs.join("\n"),
    };
  } catch (err: any) {
    return { pass: false, scorePercent: 0, log: "Ошибка тестирующей системы: " + err.message };
  }
}
// Экспорт совместимых имён для route.ts
export const gradeQuiz = gradeQuizOrNumeric;
export const gradeAlgorithmicCode = gradePythonCode;