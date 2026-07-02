import type { Question } from '../types'
import { byLevel, numberChoices, randInt, uid } from '../utils/random'

// ステージ4：10の まとまり（「10と いくつ」で 11〜20）
// 出題タイプは 3しゅるい（レベルで でやすさが 変わる）：
//   total   … 10と 3で いくつ？
//   ones    … 13は 10と いくつ？
//   missing … 10と □で 13（L3。ばらを かくして 考えさせる）
export function generateStage4(level: number): Question {
  const onesMax = byLevel(level, [5, 7, 9])
  const ones = randInt(1, onesMax)
  const total = 10 + ones

  const missingChance = byLevel(level, [0, 0, 0.3])
  const reverseChance = byLevel(level, [0.2, 0.5, 0.4])
  const roll = Math.random()

  if (roll < missingChance) {
    // 10と □で 13（ばらは かくす）
    return {
      id: uid(),
      prompt: `10と □で ${total}`,
      visual: { kind: 'tenAndOnes', ones, hideOnes: true },
      choices: numberChoices(ones, { min: 1, max: 9 }),
      answer: String(ones),
      hints: [
        `10に あと いくつ たすと ${total}に なるかな？`,
        `${total}の いちのくらい（みぎの すうじ）が こたえだよ。`,
      ],
    }
  }

  if (roll < missingChance + reverseChance) {
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
