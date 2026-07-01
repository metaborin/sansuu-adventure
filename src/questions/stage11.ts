import type { Choice, Question } from '../types'
import { byLevel, sample, sampleMany, shuffle, uid } from '../utils/random'

// ステージ11：かたちを みつけよう（まる・さんかく・しかく）
// レベルで「もの→かたち」問題の でやすさと、あつかう かたちを 変える
type Shape = { id: string; name: string; emoji: string }

const SHAPES: Shape[] = [
  { id: 'circle', name: 'まる', emoji: '🔵' },
  { id: 'triangle', name: 'さんかく', emoji: '🔺' },
  { id: 'square', name: 'しかく', emoji: '🟦' },
  { id: 'star', name: 'ほし', emoji: '⭐' },
  { id: 'heart', name: 'ハート', emoji: '💛' },
]

// 身のまわりの もの → どの かたち か
const OBJECTS: { emoji: string; shapeId: string }[] = [
  { emoji: '⚽', shapeId: 'circle' },
  { emoji: '🍕', shapeId: 'triangle' },
  { emoji: '📗', shapeId: 'square' },
  { emoji: '🕐', shapeId: 'circle' },
  { emoji: '🍙', shapeId: 'triangle' },
  { emoji: '🎁', shapeId: 'square' },
  { emoji: '🍪', shapeId: 'circle' },
  { emoji: '📺', shapeId: 'square' },
]

function shapeChoices(correct: Shape): Choice[] {
  const others = sampleMany(
    SHAPES.filter((s) => s.id !== correct.id),
    3
  )
  return shuffle([correct, ...others]).map((s) => ({ label: s.emoji, value: s.id }))
}

export function generateStage11(level: number): Question {
  const matchChance = byLevel(level, [0, 0.4, 0.6])
  const askMatch = Math.random() < matchChance

  if (askMatch) {
    // この もの と おなじ かたちは どれ？
    const obj = sample(OBJECTS)
    const correct = SHAPES.find((s) => s.id === obj.shapeId)!
    return {
      id: uid(),
      prompt: 'これと おなじ かたちは どれ？',
      visual: { kind: 'shapeObject', emoji: obj.emoji },
      choices: shapeChoices(correct),
      answer: correct.id,
      hints: [
        'まるい？ とがってる？ かどが 4つ？ よーく みてみよう。',
        `これは まるい かたち？ それとも かどが ある かたち？ おなじ なかまを さがそう。`,
      ],
    }
  }

  // 「まる」は どれ？（レベルが たかいと ほし・ハートも 出題に）
  const answerPool = byLevel(level, [SHAPES.slice(0, 3), SHAPES, SHAPES]) as Shape[]
  const correct = sample(answerPool)
  return {
    id: uid(),
    prompt: `「${correct.name}」は どれ？`,
    visual: { kind: 'none' },
    choices: shapeChoices(correct),
    answer: correct.id,
    hints: [`${correct.name}の かたちを おもいだして さがそう。`, `${correct.emoji} これが ${correct.name}だよ。`],
  }
}
