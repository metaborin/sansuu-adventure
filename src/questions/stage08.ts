import type { Question } from '../types'
import { numberChoices, randInt, uid } from '../utils/random'

// ステージ8：10を つくろう（10の あわせ・わけ ＝ 10の ほすう）
// 10の ほすうは 1〜9 が すべて だいじなので、レベルでは かずを 変えず
// （出題は まいかい ランダム）。level は 受け取るが 数の範囲は 変えない。
export function generateStage8(_level: number): Question {
  const known = randInt(1, 9)
  const answer = 10 - known
  const askForward = Math.random() < 0.5

  const prompt = askForward ? `${known}と □で 10` : `10は ${known}と □`

  return {
    id: uid(),
    prompt,
    visual: { kind: 'makeTen', filled: known },
    answer: String(answer),
    choices: numberChoices(answer, { min: 0, max: 10 }),
    hints: [
      '10の おへやが なんこ あいているかな？ あいている ぶんが こたえだよ。',
      `${known}こ はいっているから、10まで あと ${answer}こ。`,
    ],
  }
}
