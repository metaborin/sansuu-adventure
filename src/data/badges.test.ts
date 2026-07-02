import { describe, expect, it } from 'vitest'
import type { Progress } from '../types'
import { BADGES, evaluateBadges } from './badges'
import { STAGES } from './stages'
import { createEmptyProgress } from '../utils/storage'

// ==========================================================================
// バッジ判定のユニットテスト
// ==========================================================================

/** テスト用：一部のステージだけ変えた進捗を作る */
function progressWith(mutate: (p: Progress) => void): Progress {
  const p = createEmptyProgress()
  mutate(p)
  return p
}

describe('バッジ定義', () => {
  it('IDが重複していない', () => {
    const ids = BADGES.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('名前・説明・絵文字がすべてある', () => {
    for (const b of BADGES) {
      expect(b.name.length).toBeGreaterThan(0)
      expect(b.how.length).toBeGreaterThan(0)
      expect(b.emoji.length).toBeGreaterThan(0)
    }
  })
})

describe('evaluateBadges', () => {
  it('まっさらな進捗では何も獲得しない', () => {
    const { newBadges } = evaluateBadges(createEmptyProgress())
    expect(newBadges).toEqual([])
  })

  it('1ステージクリアで「はじめての クリア」', () => {
    const p = progressWith((p) => {
      p.stages[1] = { cleared: true, bestCorrect: 4, stars: 2, level: 1, misses: 1 }
    })
    const { progress, newBadges } = evaluateBadges(p)
    expect(newBadges.map((b) => b.id)).toContain('first-clear')
    expect(progress.badges).toContain('first-clear')
  })

  it('5問全問正解（スター3）で「パーフェクト」', () => {
    const p = progressWith((p) => {
      p.stages[1] = { cleared: true, bestCorrect: 5, stars: 3, level: 2, misses: 0 }
    })
    expect(evaluateBadges(p).newBadges.map((b) => b.id)).toContain('first-perfect')
  })

  it('スター10こ・30このしきい値', () => {
    const p10 = progressWith((p) => {
      // 5ステージ×2スター = 10
      for (let i = 1; i <= 5; i++) p.stages[i] = { cleared: true, bestCorrect: 4, stars: 2, level: 1, misses: 1 }
    })
    const ids10 = evaluateBadges(p10).newBadges.map((b) => b.id)
    expect(ids10).toContain('stars-10')
    expect(ids10).not.toContain('stars-30')

    const p30 = progressWith((p) => {
      // 10ステージ×3スター = 30
      for (let i = 1; i <= 10; i++) p.stages[i] = { cleared: true, bestCorrect: 5, stars: 3, level: 1, misses: 0 }
    })
    expect(evaluateBadges(p30).newBadges.map((b) => b.id)).toContain('stars-30')
  })

  it('全ステージクリアで「だいぼうけん たっせい」', () => {
    const p = progressWith((p) => {
      for (const s of STAGES) p.stages[s.id] = { cleared: true, bestCorrect: 4, stars: 2, level: 1, misses: 0 }
    })
    const ids = evaluateBadges(p).newBadges.map((b) => b.id)
    expect(ids).toContain('clear-all')
    expect(ids).toContain('clear-5')
    expect(ids).toContain('first-clear')
  })

  it('レベル3で「レベル3 とうたつ」、ふくしゅうクリアで「ふくしゅう めいじん」', () => {
    const pLv = progressWith((p) => {
      p.stages[3] = { cleared: true, bestCorrect: 5, stars: 3, level: 3, misses: 0 }
    })
    expect(evaluateBadges(pLv).newBadges.map((b) => b.id)).toContain('level-3')

    const pRev = progressWith((p) => {
      p.reviewClears = 1
    })
    expect(evaluateBadges(pRev).newBadges.map((b) => b.id)).toContain('review-clear')
  })

  it('いちど獲得したバッジは条件を満たさなくなっても消えない', () => {
    // レベルが下がっても level-3 バッジは残る
    const p = progressWith((p) => {
      p.badges = ['level-3']
      // 全ステージ レベル1（条件は満たしていない）
    })
    const { progress, newBadges } = evaluateBadges(p)
    expect(progress.badges).toContain('level-3')
    expect(newBadges.map((b) => b.id)).not.toContain('level-3') // 二重獲得しない
  })

  it('獲得済みのものは newBadges に入らない（重複なし）', () => {
    const p = progressWith((p) => {
      p.stages[1] = { cleared: true, bestCorrect: 4, stars: 2, level: 1, misses: 1 }
    })
    const first = evaluateBadges(p)
    const second = evaluateBadges(first.progress)
    expect(second.newBadges).toEqual([])
    // badges 配列に重複がない
    expect(new Set(first.progress.badges).size).toBe(first.progress.badges.length)
  })
})
