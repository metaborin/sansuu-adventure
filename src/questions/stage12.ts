import type { Question } from '../types'
import { randInt, sample, uid } from '../utils/random'

// ステージ12：ながさ・ひろさ・かさ（ちょくせつ くらべる）
type Variant = 'length' | 'area' | 'volume'

const CONFIG: Record<Variant, { more: string; less: string; ask: 'more' | 'less' }[]> = {
  length: [
    { more: 'ながい', less: 'みじかい', ask: 'more' },
    { more: 'ながい', less: 'みじかい', ask: 'less' },
  ],
  area: [
    { more: 'ひろい', less: 'せまい', ask: 'more' },
    { more: 'ひろい', less: 'せまい', ask: 'less' },
  ],
  volume: [
    { more: 'おおい', less: 'すくない', ask: 'more' },
    { more: 'おおい', less: 'すくない', ask: 'less' },
  ],
}

export function generateStage12(): Question {
  const variant = sample<Variant>(['length', 'area', 'volume'])
  const cfg = sample(CONFIG[variant])

  // 左右で ちがう おおきさ（1〜3）
  let left = randInt(1, 3)
  let right = randInt(1, 3)
  while (left === right) right = randInt(1, 3)

  const word = cfg.ask === 'more' ? cfg.more : cfg.less
  // ask=more なら 大きいほう、ask=less なら 小さいほう が こたえ
  const answer = cfg.ask === 'more' ? (left > right ? 'left' : 'right') : left < right ? 'left' : 'right'

  return {
    id: uid(),
    prompt: `どちらが ${word}？`,
    visual: { kind: 'measure', variant, left, right },
    choices: [
      { label: '⬅️ ひだり', value: 'left' },
      { label: 'みぎ ➡️', value: 'right' },
    ],
    answer,
    hint: 'はしを そろえて くらべると わかりやすいよ。',
  }
}
