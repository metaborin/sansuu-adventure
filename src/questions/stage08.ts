import type { Question } from '../types'
import { numberChoices, randInt, uid } from '../utils/random'

// ステージ8：10を つくろう（10の あわせ・わけ ＝ 10の ほすう）
export function generateStage8(): Question {
  const known = randInt(1, 9)
  const answer = 10 - known
  const askForward = Math.random() < 0.5

  const prompt = askForward ? `${known}と □で 10` : `10は ${known}と □`

  return {
    id: uid(),
    prompt,
    visual: { kind: 'makeTen', filled: known },
    choices: numberChoices(answer, { min: 0, max: 10 }),
    answer: String(answer),
    hint: '10の おへやが なんこ あいているかな？ あいている ぶんが こたえだよ。',
  }
}
