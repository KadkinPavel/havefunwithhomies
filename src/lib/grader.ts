export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface QuizPayload {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CodePayload {
  task: string;
  starterCode: string;
  testCases: TestCase[];
}

export function gradeQuiz(payloadJson: string, answer: string): { pass: boolean; scorePercent: number; log: string } {
  try {
    const data: QuizPayload = JSON.parse(payloadJson);
    const chosen = parseInt(answer, 10);
    const pass = chosen === data.correctIndex;
    return {
      pass,
      scorePercent: pass ? 100 : 0,
      log: pass ? "Верно! Контрольный вопрос пройден." : "Неверный ответ. Попробуйте еще раз."
    };
  } catch {
    return { pass: false, scorePercent: 0, log: "Ошибка проверки данных шага" };
  }
}

export function gradeAlgorithmicCode(payloadJson: string, userCode: string): { pass: boolean; scorePercent: number; log: string } {
  try {
    const data: CodePayload = JSON.parse(payloadJson);
    let passedCount = 0;
    const logs: string[] = [];

    // Встроенный безопасный JS-раннер для младших/средних классов (на хакатоне не требует сложных внешних песочниц)
    for (let i = 0; i < data.testCases.length; i++) {
      const tc = data.testCases[i];
      try {
        const runner = new Function("input", `
          let output = "";
          const print = (v) => { output += (output ? "\\n" : "") + String(v); };
          ${userCode}
          if (typeof solve === "function") {
            const res = solve(input);
            if (res !== undefined) print(res);
          }
          return output.trim();
        `);

        const result = String(runner(tc.input)).trim();
        const expected = tc.expectedOutput.trim();

        if (result === expected) {
          passedCount++;
          logs.push(`Тест ${i + 1}: Пройден (OK)`);
        } else {
          logs.push(`Тест ${i + 1}: Ошибка! Ожидалось: "${expected}", получено: "${result}"`);
        }
      } catch (err: any) {
        logs.push(`Тест ${i + 1}: Ошибка времени исполнения (${err.message})`);
      }
    }

    const pass = passedCount === data.testCases.length;
    const scorePercent = Math.round((passedCount / data.testCases.length) * 100);

    return {
      pass,
      scorePercent,
      log: logs.join("\n")
    };
  } catch (err: any) {
    return { pass: false, scorePercent: 0, log: "Сбой тестирующей системы: " + err.message };
  }
}