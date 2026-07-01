import type { Progress, StageProgress } from '../types'
import { STAGES } from '../data/stages'

// ==========================================================================
// 進捗の保存・よみこみ（localStorage）
// データの形をかえたら PROGRESS_VERSION を上げると、古いデータをリセットします。
// ==========================================================================

const STORAGE_KEY = 'sansuu-adventure-1nensei:progress'
const PROGRESS_VERSION = 1

/** まっさらな進捗を作る */
export function createEmptyProgress(): Progress {
  const stages: Record<number, StageProgress> = {}
  for (const s of STAGES) {
    stages[s.id] = { cleared: false, bestCorrect: 0, stars: 0 }
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
    // あとから増えたステージにも対応（無い分をうめる）
    const base = createEmptyProgress()
    return {
      ...base,
      ...parsed,
      stages: { ...base.stages, ...parsed.stages },
    }
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
