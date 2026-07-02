import type { Question } from '../types'
import { byLevel, randInt, sampleMany, shuffle, uid } from '../utils/random'

// ステージ3：なんばんめ？（まえ・うしろ・ひだり・みぎ から の じゅんばん）
// レベル1は まえ・うしろ だけ。レベル2からは ひだり・みぎ も まぜる。
// レベルで ならぶ かずも 変える（4→5→6）
const ANIMALS = ['🐭', '🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁']

export function generateStage3(level: number): Question {
  const len = byLevel(level, [4, 5, 6])
  const items = sampleMany(ANIMALS, len)

  // ことばの じく：まえ/うしろ か ひだり/みぎ か
  const lrChance = byLevel(level, [0, 0.5, 0.5])
  const useLR = Math.random() < lrChance
  const ends: [string, string] = useLR ? ['ひだり', 'みぎ'] : ['まえ', 'うしろ']

  // どちら側から かぞえるか（まえ・ひだり ＝ ひだり側）
  const fromRight = Math.random() < 0.5
  const countFrom: 'left' | 'right' = fromRight ? 'right' : 'left'
  const word = fromRight ? ends[1] : ends[0]

  const nth = randInt(1, items.length)
  const targetIndex = countFrom === 'left' ? nth - 1 : items.length - nth
  const target = items[targetIndex]

  return {
    id: uid(),
    prompt: `${word}から ${nth}ばんめの どうぶつは どれ？`,
    visual: { kind: 'ordinalRow', items, targetIndex, ends, countFrom },
    choices: shuffle(items).map((a) => ({ label: a, value: a })),
    answer: target,
    hints: [
      `${word}から、ひとつずつ ゆびで かぞえてみよう！`,
      `いちばん ${countFrom === 'left' ? 'ひだり' : 'みぎ'}が「${word}から 1ばんめ」だよ。そこから ${nth}こめを さがそう。`,
    ],
  }
}
