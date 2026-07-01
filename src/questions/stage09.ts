import type { Question } from '../types'
import { numberChoices, randInt, uid } from '../utils/random'

// ステージ9：たしざん その2（くりあがり あり。10を つくって かんがえる）
export function generateStage9(): Question {
  // a + b が 11〜18 になる（どちらも 1けた、くりあがり あり）
  let a = randInt(5, 9)
  let b = randInt(5, 9)
  while (a + b < 11 || a + b > 18) {
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
    hint: `${b}を ${need}と ${b - need}に わけて、まず ${a}で 10を つくろう！`,
  }
}
