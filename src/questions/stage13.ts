import type { Choice, Question } from '../types'
import { byLevel, randInt, sample, shuffle, uid } from '../utils/random'

// ステージ13：とけいを よもう
// レベル1：「なんじ」（ちょうど）だけ
// レベル2：「なんじはん」も まぜる
// レベル3：「なんじなんぷん」（5ふん きざみ）も まぜる
const SCENES = [
  { hour: 8, text: '🏫 がっこうに いく じかん' },
  { hour: 10, text: '📖 べんきょうの じかん' },
  { hour: 12, text: '🍚 きゅうしょくの じかん' },
  { hour: 3, text: '🍪 おやつの じかん' },
  { hour: 6, text: '🍛 ばんごはんの じかん' },
  { hour: 9, text: '🛌 ねる じかん' },
]

/** 5ふん きざみの「なんぷん」（0と 30は べつあつかい） */
const FIVE_MINUTES = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55]

/** 「ふん／ぷん」の よみかた（10・20・40・50 は「ぷん」） */
function minuteReading(m: number): string {
  return [10, 20, 40, 50].includes(m) ? `${m}ぷん` : `${m}ふん`
}

function timeLabel(hour: number, minute: number): string {
  if (minute === 0) return `${hour}じ`
  if (minute === 30) return `${hour}じはん`
  return `${hour}じ${minuteReading(minute)}`
}

/** せいかいと おなじ しゅるいの じこくで、まぎらわしい 選択肢を つくる */
function minutePool(minute: number): number[] {
  if (minute === 0) return [0]
  if (minute === 30) return [0, 30]
  return FIVE_MINUTES
}

function timeChoices(hour: number, minute: number): Choice[] {
  const pool = minutePool(minute)
  const correctValue = `${hour}:${minute}`
  const set = new Map<string, Choice>()
  set.set(correctValue, { label: timeLabel(hour, minute), value: correctValue })
  let guard = 0
  while (set.size < 4 && guard < 100) {
    guard += 1
    const h = ((hour - 1 + randInt(0, 11)) % 12) + 1
    const m = pool[Math.floor(Math.random() * pool.length)]
    const v = `${h}:${m}`
    if (!set.has(v)) set.set(v, { label: timeLabel(h, m), value: v })
  }
  return shuffle([...set.values()])
}

export function generateStage13(level: number): Question {
  const fiveChance = byLevel(level, [0, 0, 0.45])
  const halfChance = byLevel(level, [0, 0.3, 0.25])
  const roll = Math.random()

  if (roll < fiveChance) {
    // なんじ なんぷん（5ふん きざみ）
    const hour = randInt(1, 12)
    const minute = sample(FIVE_MINUTES)
    return {
      id: uid(),
      prompt: 'とけいは なんじなんぷん？',
      visual: { kind: 'clock', hour, minute },
      choices: timeChoices(hour, minute),
      answer: `${hour}:${minute}`,
      hints: [
        'ながい はりが「1」で 5ふん、「2」で 10ぷん。5ずつ かぞえよう。',
        'みじかい はりが すぎた すうじが「なんじ」。ながい はりは 5・10・15…と かぞえよう。',
      ],
    }
  }

  const half = roll < fiveChance + halfChance
  const minute = half ? 30 : 0
  const useScene = !half && Math.random() < 0.5

  if (useScene) {
    const scene = sample(SCENES)
    return {
      id: uid(),
      prompt: `${scene.text}。なんじ？`,
      visual: { kind: 'clock', hour: scene.hour, minute: 0 },
      choices: timeChoices(scene.hour, 0),
      answer: `${scene.hour}:0`,
      hints: [
        'みじかい はりが さして いる すうじを よもう。',
        'ながい はりが うえ（12）を さして いたら「ちょうど なんじ」だよ。',
      ],
    }
  }

  const hour = randInt(1, 12)
  return {
    id: uid(),
    prompt: 'とけいは なんじ？',
    visual: { kind: 'clock', hour, minute },
    choices: timeChoices(hour, minute),
    answer: `${hour}:${minute}`,
    hints: half
      ? ['ながい はりが した（6）を さして いたら「はん」だよ。', 'みじかい はりが すぎた すうじが「なんじ」。ながい はりが 6なら「はん」。']
      : ['みじかい はりが さして いる すうじを よもう。', 'ながい はりが うえ（12）なら「ちょうど なんじ」だよ。'],
  }
}
