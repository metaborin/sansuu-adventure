import type { Question } from '../types'
import { byLevel, numberChoices, randInt, uid } from '../utils/random'

// ステージ4：10の まとまり（「10と いくつ」で 11〜20）
// レベルで「ばら」の かずと、ぎゃく向き問題の でやすさを 変える
export function generateStage4(level: number): Question {
  const onesMax = byLevel(level, [5, 7, 9])
  const reverseChance = byLevel(level, [0.2, 0.5, 0.7])
  const ones = randInt(1, onesMax)
  const total = 10 + ones
  const askTotal = Math.random() >= reverseChance

  if (askTotal) {
    // 10と 3で いくつ？
    return {
      id: uid(),
      prompt: `10と ${ones}で いくつ？`,
      visual: { kind: 'tenAndOnes', ones },
      choices: numberChoices(total, { min: 10, max: 20 }),
      answer: String(total),
      hints: [
        '10の まとまりに、ばらの ぶんを たすと いくつかな？',
        `10の つぎから「11・12…」と ばらの かず（${ones}こ）だけ すすもう。`,
      ],
    }
  }

  // 13は 10と いくつ？
  return {
    id: uid(),
    prompt: `${total}は 10と いくつ？`,
    visual: { kind: 'tenAndOnes', ones },
    choices: numberChoices(ones, { min: 1, max: 9 }),
    answer: String(ones),
    hints: [
      '10の まとまりの ほかに、ばらが いくつ あるかな？',
      `${total}の いちのくらい（みぎの すうじ）が こたえだよ。`,
    ],
  }
}
