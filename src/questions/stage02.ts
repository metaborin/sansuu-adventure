import type { Question } from '../types'
import { byLevel, randInt, sampleMany, uid } from '../utils/random'

// ステージ2：どちらが おおい？（かずの おおい・すくない・おなじ）
// レベルが あがると かずが おおきく／さが ちいさく（くらべにくく）なる
const EMOJIS = ['🍎', '⭐', '🍓', '🐟', '🎈', '🍊', '🐱', '🐶', '🌸']

export function generateStage2(level: number): Question {
  const [le, re] = sampleMany(EMOJIS, 2)
  const max = byLevel(level, [5, 7, 9])
  const maxDiff = byLevel(level, [9, 3, 2]) // レベルが たかいほど さが ちいさい

  const left = randInt(1, max)
  let right: number
  if (Math.random() < 0.25) {
    right = left // 「おなじ」
  } else {
    const diff = randInt(1, maxDiff)
    right = Math.random() < 0.5 ? left + diff : left - diff
    right = Math.min(Math.max(right, 1), max)
    if (right === left) right = left === max ? left - 1 : left + 1
  }

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
    // ひだり・おなじ・みぎ は いちを あらわすので、よこ1れつ で ならべる
    choiceLayout: 'row',
    choices: [
      { label: '⬅️ ひだり', value: 'left' },
      { label: '🟰 おなじ', value: 'same' },
      { label: 'みぎ ➡️', value: 'right' },
    ],
    answer,
    hints: [
      'ひだりと みぎを、うえから じゅんばんに くらべてみよう。',
      'ペアに ならなくて あまった ほうが「おおい」、どちらも あまらなければ「おなじ」だよ。',
    ],
  }
}
