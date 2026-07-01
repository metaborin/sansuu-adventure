import type { Question } from '../types'
import { generateStage1 } from './stage01'
import { generateStage2 } from './stage02'
import { generateStage3 } from './stage03'
import { generateStage4 } from './stage04'
import { generateStage5 } from './stage05'
import { generateStage6 } from './stage06'
import { generateStage7 } from './stage07'
import { generateStage8 } from './stage08'
import { generateStage9 } from './stage09'
import { generateStage10 } from './stage10'
import { generateStage11 } from './stage11'
import { generateStage12 } from './stage12'
import { generateStage13 } from './stage13'
import { generateStage14 } from './stage14'

// ==========================================================================
// 問題生成のまとめ役（ディスパッチャ）
// ステージID から、その ステージの問題生成関数を よびだします。
// 新しい ステージを ふやすときは、ここに 1 行 足すだけ。
// ==========================================================================

type Generator = () => Question

const GENERATORS: Record<number, Generator> = {
  1: generateStage1,
  2: generateStage2,
  3: generateStage3,
  4: generateStage4,
  5: generateStage5,
  6: generateStage6,
  7: generateStage7,
  8: generateStage8,
  9: generateStage9,
  10: generateStage10,
  11: generateStage11,
  12: generateStage12,
  13: generateStage13,
  14: generateStage14,
}

/** 1問だけ作る */
export function generateOne(stageId: number): Question {
  const gen = GENERATORS[stageId] ?? generateStage1
  return gen()
}

/**
 * ステージ用に n 問（デフォルト5問）作る。
 * なるべく おなじ問題が つづかない ように、かんたんな重複チェックをします。
 */
export function generateQuestions(stageId: number, n = 5): Question[] {
  const gen = GENERATORS[stageId] ?? generateStage1
  const out: Question[] = []
  const seen = new Set<string>()
  let guard = 0

  while (out.length < n && guard < n * 30) {
    guard += 1
    const q = gen()
    const key = `${q.prompt}|${q.answer}|${JSON.stringify(q.visual)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(q)
  }
  // それでも足りなければ、重複チェックなしで うめる
  while (out.length < n) out.push(gen())

  return out
}
