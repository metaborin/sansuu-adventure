import type { Question } from '../types'
import { byLevel, sampleMany, shuffle, uid } from '../utils/random'

// ステージ14：えグラフを よもう（えグラフで かずを くらべる）
// レベルで しゅるいの かずと、かずの おおきさを 変える
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

export function generateStage14(level: number): Question {
  const numCats = byLevel(level, [3, 3, 4])
  const countPool = byLevel<number[]>(level, [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7],
  ])
  const picked = sampleMany(ITEMS, numCats)

  // かずが かぶらない ように 割りあてる（さいだい・さいしょうが 1つに きまるように）
  const counts = shuffle(countPool).slice(0, picked.length)
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
    hints: [
      askMost ? 'えが いちばん ながく ならんで いるのは どれかな？' : 'えが いちばん みじかいのは どれかな？',
      askMost ? 'よこに いちばん ながい すじの ものを えらぼう。' : 'よこに いちばん みじかい すじの ものを えらぼう。',
    ],
  }
}
