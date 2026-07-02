import type { Question } from '../types'
import { byLevel, randInt, sample, shuffle, uid } from '../utils/random'

// ステージ12：ながさ・ひろさ・かさ（ちょくせつ くらべる）
// レベルで あつかう しゅるいと、おおきさの さ（くらべやすさ）を 変える
type Variant = 'length' | 'area' | 'volume'

const WORDS: Record<Variant, { more: string; less: string }> = {
  length: { more: 'ながい', less: 'みじかい' },
  area: { more: 'ひろい', less: 'せまい' },
  volume: { more: 'おおい', less: 'すくない' },
}

export function generateStage12(level: number): Question {
  const variantPool = byLevel<Variant[]>(level, [
    ['length'],
    ['length', 'area', 'volume'],
    ['length', 'area', 'volume'],
  ])
  const variant = sample(variantPool)

  // レベル1は さが おおきくて わかりやすい（1と3）。レベル2・3は となりあう さ（さ1）で むずかしい。
  const bigDiff = byLevel(level, [true, false, false])
  let pair: number[]
  if (bigDiff) {
    pair = shuffle([1, 3])
  } else {
    const base = randInt(1, 2)
    pair = shuffle([base, base + 1])
  }
  const [left, right] = pair

  const askMore = Math.random() < 0.5
  const word = askMore ? WORDS[variant].more : WORDS[variant].less
  const answer: 'left' | 'right' = askMore
    ? left > right
      ? 'left'
      : 'right'
    : left < right
      ? 'left'
      : 'right'

  return {
    id: uid(),
    prompt: `どちらが ${word}？`,
    // highlight: こたえ合わせ後に せいかいの がわを ひからせる
    visual: { kind: 'measure', variant, left, right, highlight: answer },
    choices: [
      { label: '⬅️ ひだり', value: 'left' },
      { label: 'みぎ ➡️', value: 'right' },
    ],
    answer,
    hints: [
      'はしを そろえて くらべると わかりやすいよ。',
      variant === 'volume' ? 'みずが たかいほうが「おおい」だよ。' : 'はみ出している ほうが おおきいよ。',
    ],
  }
}
