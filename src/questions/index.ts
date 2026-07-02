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

// 各ステージの生成関数は、難易度レベル（1〜3）を受け取ります。
type Generator = (level: number) => Question

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

/** 1問だけ作る（level: 難易度 1〜3） */
export function generateOne(stageId: number, level = 1): Question {
  const gen = GENERATORS[stageId] ?? generateStage1
  return gen(level)
}

/** ふくしゅうの 出題もと（どのステージを どのくらい 出すか） */
export interface ReviewEntry {
  stageId: number
  /** そのステージの いまの 難易度レベル */
  level: number
  /** 重み（まちがえた数）。おおきいほど 出やすい */
  weight: number
}

/**
 * ふくしゅう用に、にがてな ステージから n 問（デフォルト5問）ミックスして作る。
 * まちがいが 多い ステージほど 出やすい（重みつき）。
 * もどり値には「どの ステージから 出題したか」も ふくむ（ふくしゅう後の 消し込み用）。
 */
export function generateReviewQuestions(
  entries: ReviewEntry[],
  n = 5
): { questions: Question[]; stageIds: number[] } {
  // 重みの ぶんだけ プールに 入れて、ランダムに 引く
  const pool: { stageId: number; level: number }[] = []
  for (const e of entries) {
    for (let i = 0; i < Math.max(1, e.weight); i++) pool.push({ stageId: e.stageId, level: e.level })
  }

  const questions: Question[] = []
  const seen = new Set<string>()
  const stageIds = new Set<number>()
  let guard = 0

  while (questions.length < n && pool.length > 0 && guard < n * 30) {
    guard += 1
    const pick = pool[Math.floor(Math.random() * pool.length)]
    const q = generateOne(pick.stageId, pick.level)
    const key = `${q.prompt}|${q.answer}|${JSON.stringify(q.visual)}`
    if (seen.has(key)) continue
    seen.add(key)
    questions.push(q)
    stageIds.add(pick.stageId)
  }
  // 重複チェックで 足りなければ、そのまま うめる
  while (questions.length < n && pool.length > 0) {
    const pick = pool[Math.floor(Math.random() * pool.length)]
    questions.push(generateOne(pick.stageId, pick.level))
    stageIds.add(pick.stageId)
  }

  return { questions, stageIds: [...stageIds] }
}

/**
 * ステージ用に n 問（デフォルト5問）作る。
 * level（1〜3）で 出題の むずかしさを 変えます。
 * なるべく おなじ問題が つづかない ように、かんたんな重複チェックをします。
 */
export function generateQuestions(stageId: number, n = 5, level = 1): Question[] {
  const gen = GENERATORS[stageId] ?? generateStage1
  const out: Question[] = []
  const seen = new Set<string>()
  let guard = 0

  while (out.length < n && guard < n * 30) {
    guard += 1
    const q = gen(level)
    const key = `${q.prompt}|${q.answer}|${JSON.stringify(q.visual)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(q)
  }
  // それでも足りなければ、重複チェックなしで うめる
  while (out.length < n) out.push(gen(level))

  return out
}
