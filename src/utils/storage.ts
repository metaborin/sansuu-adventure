import type { Progress, StageProgress } from '../types'
import { STAGES } from '../data/stages'

// ==========================================================================
// 進捗の保存・よみこみ（localStorage）
// データの形をかえたら PROGRESS_VERSION を上げると、古いデータをリセットします。
// ==========================================================================

const STORAGE_KEY = 'sansuu-adventure-1nensei:progress'
const PROGRESS_VERSION = 1

/** 難易度レベルの上限 */
export const MAX_LEVEL = 3

/** ステージ進捗の初期値 */
function emptyStage(): StageProgress {
  return { cleared: false, bestCorrect: 0, stars: 0, level: 1 }
}

/** よみこんだ古いデータに足りない項目をうめる（グレースフル移行） */
function normalizeStage(raw: Partial<StageProgress> | undefined): StageProgress {
  return { ...emptyStage(), ...(raw ?? {}) }
}

/** まっさらな進捗を作る */
export function createEmptyProgress(): Progress {
  const stages: Record<number, StageProgress> = {}
  for (const s of STAGES) {
    stages[s.id] = emptyStage()
  }
  return { version: PROGRESS_VERSION, stages, unlockedAll: false }
}

/** 進捗をよみこむ（なければ・こわれていれば 新規作成） */
export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyProgress()
    const parsed = JSON.parse(raw) as Progress
    if (parsed.version !== PROGRESS_VERSION || !parsed.stages) {
      return createEmptyProgress()
    }
    // あとから増えたステージ・新項目（level など）にも対応（無い分をうめる）
    const stages: Record<number, StageProgress> = {}
    for (const s of STAGES) {
      stages[s.id] = normalizeStage(parsed.stages[s.id])
    }
    return { version: PROGRESS_VERSION, stages, unlockedAll: Boolean(parsed.unlockedAll) }
  } catch {
    return createEmptyProgress()
  }
}

/** 進捗を保存する */
export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // 保存できなくてもゲームは続けられるように、エラーは無視
  }
}

/** ステージが遊べる（解放されている）か */
export function isStageUnlocked(progress: Progress, stageId: number): boolean {
  if (stageId === 1) return true
  if (progress.unlockedAll) return true
  const prev = progress.stages[stageId - 1]
  return Boolean(prev?.cleared)
}

/** スターの合計 */
export function totalStars(progress: Progress): number {
  return Object.values(progress.stages).reduce((sum, s) => sum + s.stars, 0)
}

/** クリア済みステージ数 */
export function clearedCount(progress: Progress): number {
  return Object.values(progress.stages).filter((s) => s.cleared).length
}

/** 正解数からスターを計算（5問中） */
export function starsForCorrect(correct: number): number {
  if (correct >= 5) return 3
  if (correct >= 4) return 2
  return 0
}

/**
 * 直近の成績（5問中の正解数）から、つぎの難易度レベルを決める。
 * ・全問（5問）正解 → レベルアップ
 * ・2問いか       → レベルダウン
 * ・それ以外       → そのまま
 */
export function nextLevel(current: number, correct: number): number {
  if (correct >= 5) return Math.min(current + 1, MAX_LEVEL)
  if (correct <= 2) return Math.max(current - 1, 1)
  return current
}
