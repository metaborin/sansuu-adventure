import type { Question } from '../types'
import { numberChoices, randInt, uid } from '../utils/random'

// ステージ4：10の まとまり（「10と いくつ」で 11〜20）
export function generateStage4(): Question {
  const ones = randInt(1, 9)
  const total = 10 + ones
  const askTotal = Math.random() < 0.6

  if (askTotal) {
    // 10と 3で いくつ？
    return {
      id: uid(),
      prompt: `10と ${ones}で いくつ？`,
      visual: { kind: 'tenAndOnes', ones },
      choices: numberChoices(total, { min: 10, max: 20 }),
      answer: String(total),
      hint: '10の まとまりに、ばらの ぶんを たすと いくつかな？',
    }
  }

  // 13は 10と いくつ？
  return {
    id: uid(),
    prompt: `${total}は 10と いくつ？`,
    visual: { kind: 'tenAndOnes', ones },
    choices: numberChoices(ones, { min: 1, max: 9 }),
    answer: String(ones),
    hint: '10の まとまりの ほかに、ばらが いくつ あるかな？',
  }
}
