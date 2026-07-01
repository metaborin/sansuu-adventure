import type { Question } from '../types'
import { numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ6：たしざん その1（くりあがり なし、こたえは 9 まで）
const EMOJIS = ['🍎', '⭐', '🍓', '🎈', '🐟', '🧱']

export function generateStage6(): Question {
  const a = randInt(1, 8)
  const b = randInt(1, 9 - a) // a + b <= 9 なので くりあがりなし
  const answer = a + b
  const emoji = sample(EMOJIS)

  return {
    id: uid(),
    prompt: `${a} + ${b} = ?`,
    visual: { kind: 'addBlocks', a, b, emoji },
    choices: numberChoices(answer, { min: 0, max: 10 }),
    answer: String(answer),
    hint: 'ぜんぶの えを、いっしょに かぞえてみよう！',
  }
}
