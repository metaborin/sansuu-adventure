import type { Question } from '../types'
import { numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ1：かずを かぞえよう（1〜10 を かぞえる）
const EMOJIS = ['🍎', '⭐', '🧱', '🍓', '🌸', '🐟', '🎈', '🍊', '🐝', '🐞']

export function generateStage1(): Question {
  const emoji = sample(EMOJIS)
  const count = randInt(1, 10)
  return {
    id: uid(),
    prompt: `${emoji} は いくつ あるかな？`,
    visual: { kind: 'objects', emoji, count },
    choices: numberChoices(count, { min: 1, max: 10 }),
    answer: String(count),
    hint: 'ゆびで さしながら、ひとつずつ かぞえてみよう！',
  }
}
