import type { Choice } from '../types'

// ==========================================================================
// らんすう・シャッフルなどの便利関数
// 問題生成のあちこちで使います。
// ==========================================================================

/** min 〜 max までの整数をランダムに返す（min, max をふくむ） */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 配列をシャッフルした新しい配列を返す（元の配列は変えない） */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 配列から1つランダムに選ぶ */
export function sample<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 配列から n 個、重複なしで選ぶ */
export function sampleMany<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/** ユニークなID（問題の key 用） */
let _counter = 0
export function uid(): string {
  _counter += 1
  return `q_${Date.now().toString(36)}_${_counter.toString(36)}`
}

/**
 * 難易度レベル（1〜3）に応じて、3つの候補から1つを選ぶ。
 * 例: byLevel(level, [20, 50, 100]) … レベル1→20, レベル2→50, レベル3→100
 * レベルが範囲外でも安全に丸めます。
 */
export function byLevel<T>(level: number, values: [T, T, T]): T {
  const i = Math.min(Math.max(Math.round(level), 1), 3) - 1
  return values[i]
}

/**
 * すうじの えらぶボタンを作る。
 * せいかい + にせもの（近い数）を混ぜて、シャッフルして返す。
 */
export function numberChoices(
  answer: number,
  opts: { count?: number; min?: number; max?: number; spread?: number } = {}
): Choice[] {
  const count = opts.count ?? 4
  const min = opts.min ?? 0
  const max = opts.max ?? 99
  const spread = opts.spread ?? 3

  const set = new Set<number>([answer])
  let guard = 0
  while (set.size < count && guard < 200) {
    guard += 1
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1)
    const v = answer + delta
    if (v >= min && v <= max) set.add(v)
  }
  // はんいが せまくて足りないときは、順番にうめる
  for (let n = min; n <= max && set.size < count; n++) set.add(n)

  return shuffle([...set]).map((v) => ({ label: String(v), value: String(v) }))
}
