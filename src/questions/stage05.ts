import type { Question, Visual } from '../types'
import { numberChoices, randInt, uid } from '../utils/random'

// ステージ5：かずの ならび（ぬけている かず・つぎ・まえ）
export function generateStage5(): Question {
  const variant = randInt(0, 2)

  // たまに 1〜100 まで、ふだんは 1〜20
  const bigRange = Math.random() < 0.3
  const max = bigRange ? 99 : 20

  if (variant === 0) {
    // ならびの中の □ をこたえる： 11 12 □ 14 15
    const start = randInt(1, max - 4)
    const nums = [start, start + 1, start + 2, start + 3, start + 4]
    const blankPos = randInt(1, 3)
    const answer = nums[blankPos]
    const shown: (number | null)[] = nums.map((n, i) => (i === blankPos ? null : n))
    const visual: Visual = { kind: 'sequence', numbers: shown }
    return {
      id: uid(),
      prompt: '□に はいる かずは？',
      visual,
      choices: numberChoices(answer, { min: 0, max: max + 1 }),
      answer: String(answer),
      hint: 'まえの かずから 1つずつ おおきく なっているよ。',
    }
  }

  if (variant === 1) {
    // 「14の つぎの かず」
    const n = randInt(1, max - 1)
    const answer = n + 1
    return {
      id: uid(),
      prompt: `${n}の つぎの かずは？`,
      visual: { kind: 'sequence', numbers: [n - 1 >= 1 ? n - 1 : n, n, null] },
      choices: numberChoices(answer, { min: 1, max: max + 1 }),
      answer: String(answer),
      hint: 'つぎ、は 1つ おおきい かずだよ。',
    }
  }

  // 「18の まえの かず」
  const n = randInt(2, max)
  const answer = n - 1
  return {
    id: uid(),
    prompt: `${n}の まえの かずは？`,
    visual: { kind: 'sequence', numbers: [null, n, n + 1 <= max ? n + 1 : n] },
    choices: numberChoices(answer, { min: 0, max }),
    answer: String(answer),
    hint: 'まえ、は 1つ ちいさい かずだよ。',
  }
}
