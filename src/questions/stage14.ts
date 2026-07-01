import type { Question } from '../types'
import { randInt, sampleMany, shuffle, uid } from '../utils/random'

// ステージ14：えグラフを よもう（えグラフで かずを くらべる）
const ITEMS = [
  { label: 'りんご', emoji: '🍎' },
  { label: 'ばなな', emoji: '🍌' },
  { label: 'みかん', emoji: '🍊' },
  { label: 'ぶどう', emoji: '🍇' },
  { label: 'いちご', emoji: '🍓' },
  { label: 'いぬ', emoji: '🐶' },
  { label: 'ねこ', emoji: '🐱' },
  { label: 'うさぎ', emoji: '🐰' },
]

export function generateStage14(): Question {
  const picked = sampleMany(ITEMS, randInt(3, 4))

  // かずが かぶらない ように 割りあてる
  const counts = shuffle([1, 2, 3, 4, 5]).slice(0, picked.length)
  const rows = picked.map((p, i) => ({ label: p.label, emoji: p.emoji, count: counts[i] }))

  const askMost = Math.random() < 0.6
  const target = rows.reduce((best, r) =>
    askMost ? (r.count > best.count ? r : best) : r.count < best.count ? r : best
  )

  return {
    id: uid(),
    prompt: askMost ? 'いちばん おおいのは どれ？' : 'いちばん すくないのは どれ？',
    visual: { kind: 'pictograph', rows },
    choices: shuffle(rows).map((r) => ({ label: `${r.emoji} ${r.label}`, value: r.label })),
    answer: target.label,
    hint: askMost
      ? 'えが いちばん ながく ならんで いるのは どれかな？'
      : 'えが いちばん みじかいのは どれかな？',
  }
}
