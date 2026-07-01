import type { Question } from '../types'
import { byLevel, numberChoices, randInt, sample, uid } from '../utils/random'

// ステージ7：ひきざん その1（くりさがり なし・日常の ばめん）
// レベルで はじめの かずの おおきさを 変える
const SCENES = [
  { emoji: '🍪', verb: 'たべました', noun: 'クッキー' },
  { emoji: '🍎', verb: 'たべました', noun: 'りんご' },
  { emoji: '🎈', verb: 'とんでいきました', noun: 'ふうせん' },
  { emoji: '🐟', verb: 'およいで いきました', noun: 'さかな' },
  { emoji: '🍬', verb: 'たべました', noun: 'あめ' },
]

export function generateStage7(level: number): Question {
  const maxA = byLevel(level, [6, 9, 10])
  const a = randInt(2, maxA)
  const b = randInt(1, a - 1) // 0 < b < a
  const answer = a - b
  const scene = sample(SCENES)

  return {
    id: uid(),
    prompt: `${scene.noun}が ${a}こ。${b}こ ${scene.verb}。のこりは いくつ？`,
    visual: { kind: 'subBlocks', a, b, emoji: scene.emoji },
    choices: numberChoices(answer, { min: 0, max: 10 }),
    answer: String(answer),
    hints: [
      'ぜんぶの かずから、へった かずを とった のこりを かぞえよう。',
      `${a}こ から ${b}こ ✕を つけて、のこった えを かぞえてみよう。`,
    ],
  }
}
