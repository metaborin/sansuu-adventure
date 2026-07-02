import { describe, expect, it } from 'vitest'
import { recordDailyClear } from './storage'
import { generateDailyQuestions } from '../questions'

// ==========================================================================
// きょうのチャレンジ：ストリーク記録と問題生成のテスト
// ==========================================================================

const TODAY = '2026-07-02'
const YESTERDAY = '2026-07-01'

describe('recordDailyClear（れんぞく記録）', () => {
  it('はじめてのクリアで streak=1, totalClears=1', () => {
    const d = recordDailyClear({ lastClearDate: null, streak: 0, totalClears: 0 }, TODAY, YESTERDAY)
    expect(d).toEqual({ lastClearDate: TODAY, streak: 1, totalClears: 1 })
  })

  it('きのうもクリアしていたら streak が +1 される', () => {
    const d = recordDailyClear({ lastClearDate: YESTERDAY, streak: 4, totalClears: 10 }, TODAY, YESTERDAY)
    expect(d).toEqual({ lastClearDate: TODAY, streak: 5, totalClears: 11 })
  })

  it('日があいたら streak は 1 にもどる（totalClears は増える）', () => {
    const d = recordDailyClear({ lastClearDate: '2026-06-20', streak: 6, totalClears: 20 }, TODAY, YESTERDAY)
    expect(d).toEqual({ lastClearDate: TODAY, streak: 1, totalClears: 21 })
  })

  it('きょう すでにクリアずみなら 何も変わらない（1日1回）', () => {
    const before = { lastClearDate: TODAY, streak: 3, totalClears: 5 }
    const d = recordDailyClear(before, TODAY, YESTERDAY)
    expect(d).toBe(before)
  })
})

describe('generateDailyQuestions（ミックス出題）', () => {
  it('5問生成され、すべて正解が選択肢にある', () => {
    for (let i = 0; i < 30; i++) {
      const qs = generateDailyQuestions(
        [
          { stageId: 1, level: 1 },
          { stageId: 6, level: 2 },
          { stageId: 8, level: 1 },
        ],
        5
      )
      expect(qs.length).toBe(5)
      for (const q of qs) {
        expect(q.choices.map((c) => c.value)).toContain(q.answer)
      }
    }
  })

  it('ステージが1つだけでも5問つくれる', () => {
    const qs = generateDailyQuestions([{ stageId: 1, level: 1 }], 5)
    expect(qs.length).toBe(5)
  })

  it('ステージが空ならステージ1にフォールバックする', () => {
    const qs = generateDailyQuestions([], 5)
    expect(qs.length).toBe(5)
    for (const q of qs) {
      expect(q.choices.map((c) => c.value)).toContain(q.answer)
    }
  })
})
