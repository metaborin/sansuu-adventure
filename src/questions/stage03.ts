import type { Question } from '../types'
import { randInt, sampleMany, shuffle, uid } from '../utils/random'

// ステージ3：なんばんめ？（まえ・うしろから の じゅんばん）
const ANIMALS = ['🐭', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁']

export function generateStage3(): Question {
  const items = sampleMany(ANIMALS, randInt(4, 5))
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
    hint: `${label}から、ひとつずつ ゆびで かぞえてみよう！`,
  }
}
