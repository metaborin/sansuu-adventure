import type { Question } from '../types'
import { byLevel, numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ6：たしざん その1（くりあがり なし）
// レベルで こたえの おおきさ（わの じょうげん）を 変える
const EMOJIS = ['🍎', '⭐', '🍓', '🎈', '🐟', '🧱']

export function generateStage6(level: number): Question {
  const sumCap = byLevel(level, [6, 8, 9]) // くりあがらない ように 9 まで
  const a = randInt(1, sumCap - 1)
  const b = randInt(1, sumCap - a)
  const answer = a + b
  const emoji = sample(EMOJIS)

  return {
    id: uid(),
    prompt: `${a} + ${b} = ?`,
    visual: { kind: 'addBlocks', a, b, emoji },
    choices: numberChoices(answer, { min: 0, max: 10 }),
    answer: String(answer),
    hints: [
      'えが でてきたよ！ ぜんぶの えを いっしょに かぞえてみよう。',
      `さいしょの ${a}から つづけて「${a + 1}・${a + 2}…」と ${b}こ すすもう。`,
    ],
  }
}
