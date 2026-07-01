import type { Question } from '../types'
import { randInt, sampleMany, uid } from '../utils/random'

// ステージ2：どちらが おおい？（かずの おおい・すくない・おなじ）
const EMOJIS = ['🍎', '⭐', '🍓', '🐟', '🎈', '🍊', '🐱', '🐶', '🌸']

export function generateStage2(): Question {
  const [le, re] = sampleMany(EMOJIS, 2)
  const left = randInt(1, 9)
  // 25% くらいで「おなじ かず」にする
  const right = Math.random() < 0.25 ? left : randInt(1, 9)

  const askMore = Math.random() < 0.5
  const prompt = askMore ? 'どちらが おおい？' : 'どちらが すくない？'

  let answer: string
  if (left === right) answer = 'same'
  else if (askMore) answer = left > right ? 'left' : 'right'
  else answer = left < right ? 'left' : 'right'

  return {
    id: uid(),
    prompt,
    visual: { kind: 'compare', left: { emoji: le, count: left }, right: { emoji: re, count: right } },
    choices: [
      { label: '⬅️ ひだり', value: 'left' },
      { label: '🟰 おなじ', value: 'same' },
      { label: 'みぎ ➡️', value: 'right' },
    ],
    answer,
    hint: 'ひだりと みぎを、うえから じゅんばんに くらべてみよう。あまった ほうが おおいよ。',
  }
}
