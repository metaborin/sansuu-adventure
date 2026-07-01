import type { Question } from '../types'
import { byLevel, randInt, sampleMany, shuffle, uid } from '../utils/random'

// ステージ3：なんばんめ？（まえ・うしろから の じゅんばん）
// レベルで ならぶ かずを 変える（4→5→6）
const ANIMALS = ['🐭', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁']

export function generateStage3(level: number): Question {
  const len = byLevel(level, [4, 5, 6])
  const items = sampleMany(ANIMALS, len)
  const from: 'front' | 'back' = Math.random() < 0.5 ? 'front' : 'back'
  const nth = randInt(1, items.length)
  const targetIndex = from === 'front' ? nth - 1 : items.length - nth
  const target = items[targetIndex]
  const label = from === 'front' ? 'まえ' : 'うしろ'

  return {
    id: uid(),
    prompt: `${label}から ${nth}ばんめの どうぶつは どれ？`,
    visual: { kind: 'ordinalRow', items, from, targetIndex },
    choices: shuffle(items).map((a) => ({ label: a, value: a })),
    answer: target,
    hints: [
      `${label}から、ひとつずつ ゆびで かぞえてみよう！`,
      `いちばん ${from === 'front' ? 'ひだり' : 'みぎ'}が「${label}から 1ばんめ」だよ。そこから ${nth}こ すすもう。`,
    ],
  }
}
