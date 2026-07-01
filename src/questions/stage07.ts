import type { Question } from '../types'
import { numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ7：ひきざん その1（くりさがり なし・日常の ばめん）
const SCENES = [
  { emoji: '🍪', verb: 'たべました', noun: 'クッキー' },
  { emoji: '🍎', verb: 'たべました', noun: 'りんご' },
  { emoji: '🎈', verb: 'とんでいきました', noun: 'ふうせん' },
  { emoji: '🐟', verb: 'およいで いきました', noun: 'さかな' },
  { emoji: '🍬', verb: 'たべました', noun: 'あめ' },
]

export function generateStage7(): Question {
  const a = randInt(2, 10)
  const b = randInt(1, a - 1) // 0 < b < a
  const answer = a - b
  const scene = sample(SCENES)

  return {
    id: uid(),
    prompt: `${scene.noun}が ${a}こ。${b}こ ${scene.verb}。のこりは いくつ？`,
    visual: { kind: 'subBlocks', a, b, emoji: scene.emoji },
    choices: numberChoices(answer, { min: 0, max: 10 }),
    answer: String(answer),
    hint: 'ぜんぶの かずから、へった かずを とった のこりを かぞえよう。',
  }
}
