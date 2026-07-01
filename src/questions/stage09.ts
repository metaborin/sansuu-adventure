import type { Question } from '../types'
import { byLevel, numberChoices, randInt, uid } from '../utils/random'

// ステージ9：たしざん その2（くりあがり あり。10を つくって かんがえる）
// レベルで こたえの おおきさ（わの じょうげん）を 変える
export function generateStage9(level: number): Question {
  const maxSum = byLevel(level, [13, 15, 18])
  // a + b が 11〜maxSum になる（どちらも 1けた、くりあがり あり）
  let a = randInt(5, 9)
  let b = randInt(5, 9)
  while (a + b < 11 || a + b > maxSum) {
    a = randInt(5, 9)
    b = randInt(5, 9)
  }
  const answer = a + b
  const need = 10 - a // a を 10 にするのに あと いくつ

  return {
    id: uid(),
    prompt: `${a} + ${b} = ?`,
    visual: { kind: 'addCarry', a, b },
    choices: numberChoices(answer, { min: 10, max: 19 }),
    answer: String(answer),
    hints: [
      `まず ${a}で 10を つくろう。`,
      `${b}を ${need}と ${b - need}に わけて、10と ${b - need}で「1${b - need}」だね。`,
    ],
  }
}
