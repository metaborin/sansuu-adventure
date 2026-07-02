import type { Question, Visual } from '../types'
import { byLevel, numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ5：かずの ならび（ぬけている かず・つぎ・まえ・とびとび）
// レベルで あつかう かずの おおきさを 変える（1〜20 → 1〜50 → 1〜100）
// レベル3では「2とび・5とび・10とび」の 数列も 出る
export function generateStage5(level: number): Question {
  const max = byLevel(level, [20, 50, 100])

  // レベル3は ときどき とびとびの 数列
  const skipChance = byLevel(level, [0, 0, 0.35])
  if (Math.random() < skipChance) {
    const step = sample([2, 5, 10])
    const maxStartMultiple = Math.floor((max - 4 * step) / step)
    const start = step * randInt(1, Math.max(1, maxStartMultiple))
    const nums = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step]
    const blankPos = randInt(1, 3)
    const answer = nums[blankPos]
    const shown: (number | null)[] = nums.map((n, i) => (i === blankPos ? null : n))
    return {
      id: uid(),
      prompt: '□に はいる かずは？',
      visual: { kind: 'sequence', numbers: shown },
      choices: numberChoices(answer, { min: 0, max: max + step, spread: step }),
      answer: String(answer),
      hints: [
        `${step}ずつ おおきく なっているよ。`,
        `${nums[blankPos - 1]}に ${step}を たした かずが はいるよ。`,
      ],
    }
  }

  const variant = randInt(0, 2)

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
      hints: [
        'まえの かずから 1つずつ おおきく なっているよ。',
        `${nums[blankPos - 1]}の つぎの かずを かんがえよう。`,
      ],
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
      hints: ['「つぎ」は 1つ おおきい かずだよ。', `${n}に 1を たすと いくつ？`],
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
    hints: ['「まえ」は 1つ ちいさい かずだよ。', `${n}から 1を へらすと いくつ？`],
  }
}
