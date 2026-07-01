import type { Choice, Question } from '../types'
import { byLevel, randInt, sample, shuffle, uid } from '../utils/random'

// ステージ13：とけいを よもう（「なんじ」ちゅうしん・ときどき「なんじはん」）
// レベルで「はん」の でやすさを 変える（L1 は「ちょうど なんじ」だけ）
const SCENES = [
  { hour: 8, text: '🏫 がっこうに いく じかん' },
  { hour: 10, text: '📖 べんきょうの じかん' },
  { hour: 12, text: '🍚 きゅうしょくの じかん' },
  { hour: 3, text: '🍪 おやつの じかん' },
  { hour: 6, text: '🍛 ばんごはんの じかん' },
  { hour: 9, text: '🛌 ねる じかん' },
]

function timeLabel(hour: number, minute: number): string {
  return minute === 30 ? `${hour}じはん` : `${hour}じ`
}

function timeChoices(hour: number, minute: number): Choice[] {
  const correctValue = `${hour}:${minute}`
  const set = new Map<string, Choice>()
  set.set(correctValue, { label: timeLabel(hour, minute), value: correctValue })
  let guard = 0
  while (set.size < 4 && guard < 50) {
    guard += 1
    const h = ((hour - 1 + randInt(0, 11)) % 12) + 1
    const m = Math.random() < 0.5 ? 0 : 30
    const v = `${h}:${m}`
    if (!set.has(v)) set.set(v, { label: timeLabel(h, m), value: v })
  }
  return shuffle([...set.values()])
}

export function generateStage13(level: number): Question {
  const halfChance = byLevel(level, [0, 0.3, 0.5])
  const half = Math.random() < halfChance
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
