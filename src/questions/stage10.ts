import type { Question } from '../types'
import { byLevel, numberChoices, randInt, uid } from '../utils/random'

// ステージ10：ひきざん その2（くりさがり あり。10の まとまりから ひく）
// レベルで はじめの かずの おおきさを 変える
export function generateStage10(level: number): Question {
  const maxA = byLevel(level, [13, 15, 18])
  const a = randInt(11, maxA)
  const onesA = a - 10
  // ばらだけでは ひけない ように、b > onesA にする（くりさがり あり）
  const b = randInt(onesA + 1, 9)
  const answer = a - b

  return {
    id: uid(),
    prompt: `${a} - ${b} = ?`,
    visual: { kind: 'subBorrow', a, b },
    choices: numberChoices(answer, { min: 1, max: 10 }),
    answer: String(answer),
    hints: [
      `10の まとまりから ${b}を ひこう。`,
      `10 - ${b} = ${10 - b}。それに ばらの ${onesA}を たして ${answer}だね。`,
    ],
  }
}
