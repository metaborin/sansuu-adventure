import type { AppSettings, DailyProgress, Progress, StageProgress } from '../types'
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
  return { cleared: false, bestCorrect: 0, stars: 0, level: 1, misses: 0 }
}

/** きょうのチャレンジの初期値 */
function emptyDaily(): DailyProgress {
  return { lastClearDate: null, streak: 0, totalClears: 0 }
}

/** よみこんだ古いデータの daily をうめる */
function normalizeDaily(raw: Partial<DailyProgress> | undefined): DailyProgress {
  return {
    lastClearDate: typeof raw?.lastClearDate === 'string' ? raw.lastClearDate : null,
    streak: typeof raw?.streak === 'number' ? raw.streak : 0,
    totalClears: typeof raw?.totalClears === 'number' ? raw.totalClears : 0,
  }
}

// --- 日付（きょうのチャレンジ用・ローカル時刻） ---------------------------

/** Date → YYYY-MM-DD */
export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return dateKey(new Date())
}

export function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dateKey(d)
}

/**
 * きょうのチャレンジを クリアしたときの きろく更新（純粋関数）。
 * ・きょう すでに クリアずみ → 変えない（1日1回だけ 数える）
 * ・きのうも クリアして いた → れんぞく +1
 * ・あいだが あいた → れんぞく 1 から やりなおし
 */
export function recordDailyClear(
  daily: DailyProgress,
  today = todayKey(),
  yesterday = yesterdayKey()
): DailyProgress {
  if (daily.lastClearDate === today) return daily
  const streak = daily.lastClearDate === yesterday ? daily.streak + 1 : 1
  return { lastClearDate: today, streak, totalClears: daily.totalClears + 1 }
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
  return {
    version: PROGRESS_VERSION,
    stages,
    unlockedAll: false,
    badges: [],
    reviewClears: 0,
    daily: emptyDaily(),
  }
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
    // あとから増えたステージ・新項目（level・badges など）にも対応（無い分をうめる）
    const stages: Record<number, StageProgress> = {}
    for (const s of STAGES) {
      stages[s.id] = normalizeStage(parsed.stages[s.id])
    }
    return {
      version: PROGRESS_VERSION,
      stages,
      unlockedAll: Boolean(parsed.unlockedAll),
      badges: Array.isArray(parsed.badges) ? parsed.badges.filter((b) => typeof b === 'string') : [],
      reviewClears: typeof parsed.reviewClears === 'number' ? parsed.reviewClears : 0,
      daily: normalizeDaily(parsed.daily),
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

/**
 * クリアに ひつような 正解数（8わり）。
 * 5問 → 4問、10問 → 8問
 */
export function clearThreshold(total: number): number {
  return Math.ceil(total * 0.8)
}

/** 正解数からスターを計算（全問=3、8わり以上=2、それ以外=0） */
export function starsForCorrect(correct: number, total = 5): number {
  if (correct >= total) return 3
  if (correct >= clearThreshold(total)) return 2
  return 0
}

/**
 * 直近の成績から、つぎの難易度レベルを決める。
 * ・全問正解        → レベルアップ
 * ・4わり以下の正解 → レベルダウン（5問なら2問、10問なら4問）
 * ・それ以外        → そのまま
 */
export function nextLevel(current: number, correct: number, total = 5): number {
  if (correct >= total) return Math.min(current + 1, MAX_LEVEL)
  if (correct <= Math.floor(total * 0.4)) return Math.max(current - 1, 1)
  return current
}

// ==========================================================================
// せんせい・ほごしゃ向けの せってい（進捗とは べつの キーに 保存）
// リセットしても せっていは 残ります。
// ==========================================================================

const SETTINGS_KEY = 'sansuu-adventure-1nensei:settings'

export function defaultSettings(): AppSettings {
  return { questionsPerStage: 5, adaptiveDifficulty: true }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings()
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      questionsPerStage: parsed.questionsPerStage === 10 ? 10 : 5,
      adaptiveDifficulty: parsed.adaptiveDifficulty !== false,
    }
  } catch {
    return defaultSettings()
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // 保存できなくてもゲームは続けられる
  }
}
