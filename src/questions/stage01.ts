import type { Question } from '../types'
import { byLevel, numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ1：かずを かぞえよう（1〜10 を かぞえる）
// レベルで かぞえる かずの おおきさを 変える（1→5, 2→8, 3→10）
const EMOJIS = ['🍎', '⭐', '🧱', '🍓', '🌸', '🐟', '🎈', '🍊', '🐝', '🐞']

export function generateStage1(level: number): Question {
  const emoji = sample(EMOJIS)
  const max = byLevel(level, [5, 8, 10])
  const count = randInt(1, max)
  return {
    id: uid(),
    prompt: `${emoji} は いくつ あるかな？`,
    visual: { kind: 'objects', emoji, count },
    choices: numberChoices(count, { min: 1, max: 10 }),
    answer: String(count),
    hints: [
      'ゆびで さしながら、ひとつずつ かぞえてみよう！',
      '「1・2・3…」と こえに だして かぞえると まちがえにくいよ。',
    ],
  }
}
