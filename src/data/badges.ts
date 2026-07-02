import type { Progress, StageProgress } from '../types'
import { STAGES } from './stages'
import { clearedCount, totalStars } from '../utils/storage'

// ==========================================================================
// バッジ定義（配列データ）
// あたらしい バッジを ふやすときは、この配列に 1つ 足すだけ。
// check は「いま の 進捗で 条件を みたして いるか」を 返す。
// いちど かくとくした バッジは progress.badges に のこりつづける
// （あとで 条件を みたさなく なっても 消えない）。
// ==========================================================================

export interface BadgeMeta {
  id: string
  /** なまえ（ひらがな） */
  name: string
  emoji: string
  /** どうすれば もらえるか（ずかんに ひょうじ） */
  how: string
  check: (progress: Progress) => boolean
}

/** 全ステージの進捗を ならべる 便利関数 */
function stageList(progress: Progress): StageProgress[] {
  return STAGES.map((s) => progress.stages[s.id]).filter(Boolean)
}

export const BADGES: BadgeMeta[] = [
  {
    id: 'first-clear',
    name: 'はじめての クリア',
    emoji: '🎈',
    how: 'ステージを 1つ クリアする',
    check: (p) => stageList(p).some((s) => s.cleared),
  },
  {
    id: 'first-perfect',
    name: 'パーフェクト',
    emoji: '🌟',
    how: '1つの ステージで 5もん ぜんぶ せいかいする',
    check: (p) => stageList(p).some((s) => s.stars >= 3),
  },
  {
    id: 'clear-5',
    name: 'ぼうけんの とちゅう',
    emoji: '🚀',
    how: 'ステージを 5つ クリアする',
    check: (p) => clearedCount(p) >= 5,
  },
  {
    id: 'clear-all',
    name: 'だいぼうけん たっせい',
    emoji: '🏆',
    how: 'ぜんぶの ステージを クリアする',
    check: (p) => clearedCount(p) >= STAGES.length,
  },
  {
    id: 'stars-10',
    name: 'スター あつめ',
    emoji: '🏅',
    how: 'スターを 10こ あつめる',
    check: (p) => totalStars(p) >= 10,
  },
  {
    id: 'stars-30',
    name: 'スターの おうさま',
    emoji: '👑',
    how: 'スターを 30こ あつめる',
    check: (p) => totalStars(p) >= 30,
  },
  {
    id: 'level-3',
    name: 'レベル3 とうたつ',
    emoji: '🎖️',
    how: 'どれかの ステージで レベル3に なる',
    check: (p) => stageList(p).some((s) => s.level >= 3),
  },
  {
    id: 'review-clear',
    name: 'ふくしゅう めいじん',
    emoji: '💪',
    how: 'ふくしゅうで 4もん いじょう せいかいする',
    check: (p) => p.reviewClears >= 1,
  },
  {
    id: 'daily-first',
    name: 'きょうの チャレンジャー',
    emoji: '🌞',
    how: 'きょうのチャレンジを クリアする',
    check: (p) => p.daily.totalClears >= 1,
  },
  {
    id: 'streak-3',
    name: '3にち れんぞく',
    emoji: '🔥',
    how: 'きょうのチャレンジを 3にち れんぞくで クリアする',
    check: (p) => p.daily.streak >= 3,
  },
  {
    id: 'streak-7',
    name: '7にち れんぞく',
    emoji: '🌈',
    how: 'きょうのチャレンジを 7にち れんぞくで クリアする',
    check: (p) => p.daily.streak >= 7,
  },
]

/** IDから バッジ情報を 引く */
export function getBadge(id: string): BadgeMeta | undefined {
  return BADGES.find((b) => b.id === id)
}

/**
 * 進捗を しらべて、あたらしく かくとくした バッジを 進捗に 追加する。
 * もどり値：{ 更新後の進捗, あたらしく とれた バッジ }
 * あたらしい バッジが なければ、progress は そのまま 返す。
 */
export function evaluateBadges(progress: Progress): {
  progress: Progress
  newBadges: BadgeMeta[]
} {
  const owned = new Set(progress.badges)
  const newBadges = BADGES.filter((b) => !owned.has(b.id) && b.check(progress))
  if (newBadges.length === 0) return { progress, newBadges }
  return {
    progress: { ...progress, badges: [...progress.badges, ...newBadges.map((b) => b.id)] },
    newBadges,
  }
}
