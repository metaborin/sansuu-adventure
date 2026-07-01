import type { Question } from '../types'
import { numberChoices, randInt, uid } from '../utils/random'

// ステージ10：ひきざん その2（くりさがり あり。10の まとまりから ひく）
export function generateStage10(): Question {
  const a = randInt(11, 18)
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
    hint: `10の まとまりから ${b}を ひいて、のこりの ${10 - b}と ${onesA}を あわせよう！`,
  }
}
