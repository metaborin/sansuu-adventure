import { describe, expect, it } from 'vitest'
import type { Question, Visual } from '../types'
import { generateOne, generateQuestions, generateReviewQuestions } from './index'

// ==========================================================================
// 問題生成のユニットテスト
// ・全ステージ×全レベルで「正解が必ず選択肢に含まれる」などの共通条件
// ・各ステージの算数的な不変条件（くり上がり必須、個数の一致 など）
// ランダム生成なので、たくさん回して検証します。
// ==========================================================================

const STAGE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const LEVELS = [1, 2, 3]
const RUNS = 200

type V<K extends Visual['kind']> = Extract<Visual, { kind: K }>

function choiceValues(q: Question): string[] {
  return q.choices.map((c) => c.value)
}

function many(stageId: number, level: number, n = RUNS): Question[] {
  return Array.from({ length: n }, () => generateOne(stageId, level))
}

// --- 共通条件 --------------------------------------------------------------
describe('共通: 全ステージ×全レベル', () => {
  for (const id of STAGE_IDS) {
    for (const lv of LEVELS) {
      it(`ステージ${id} レベル${lv}: 正解が選択肢にあり、重複や空がない`, () => {
        for (const q of many(id, lv)) {
          expect(q.prompt.length, `prompt空 (stage${id})`).toBeGreaterThan(0)
          expect(q.hints.length, `ヒントなし (stage${id})`).toBeGreaterThanOrEqual(1)
          expect(q.choices.length, `選択肢が少ない (stage${id})`).toBeGreaterThanOrEqual(2)
          const vals = choiceValues(q)
          expect(new Set(vals).size, `選択肢が重複 (stage${id}): ${vals.join(',')}`).toBe(vals.length)
          expect(vals, `正解が選択肢にない (stage${id}): ans=${q.answer}`).toContain(q.answer)
        }
      })
    }
  }
})

// --- ステージ別の不変条件 ----------------------------------------------------
describe('ステージ1: かぞえる', () => {
  it('絵の数と答えが一致する', () => {
    for (const lv of LEVELS) {
      for (const q of many(1, lv)) {
        const v = q.visual as V<'objects'>
        expect(v.kind).toBe('objects')
        expect(String(v.count)).toBe(q.answer)
        expect(v.count).toBeGreaterThanOrEqual(1)
        expect(v.count).toBeLessThanOrEqual(10)
      }
    }
  })
})

describe('ステージ2: どちらが おおい？', () => {
  it('絵の個数から答えを再計算すると一致する', () => {
    for (const lv of LEVELS) {
      for (const q of many(2, lv)) {
        const v = q.visual as V<'compare'>
        const askMore = q.prompt.includes('おおい')
        let expected: string
        if (v.left.count === v.right.count) expected = 'same'
        else if (askMore) expected = v.left.count > v.right.count ? 'left' : 'right'
        else expected = v.left.count < v.right.count ? 'left' : 'right'
        expect(q.answer).toBe(expected)
      }
    }
  })
})

describe('ステージ3: なんばんめ？', () => {
  it('targetIndex が「◯ばんめ」と一致し、答えはその動物', () => {
    for (const lv of LEVELS) {
      for (const q of many(3, lv)) {
        const v = q.visual as V<'ordinalRow'>
        const nth = Number(/(\d+)ばんめ/.exec(q.prompt)?.[1])
        const expectedIndex = v.countFrom === 'left' ? nth - 1 : v.items.length - nth
        expect(v.targetIndex).toBe(expectedIndex)
        expect(q.answer).toBe(v.items[v.targetIndex])
      }
    }
  })
  it('レベル1は まえ・うしろ だけ', () => {
    for (const q of many(3, 1)) {
      const v = q.visual as V<'ordinalRow'>
      expect(v.ends).toEqual(['まえ', 'うしろ'])
    }
  })
})

describe('ステージ4: 10の まとまり', () => {
  it('3つの出題タイプすべてで答えが正しい', () => {
    for (const lv of LEVELS) {
      for (const q of many(4, lv)) {
        const v = q.visual as V<'tenAndOnes'>
        let m: RegExpExecArray | null
        if ((m = /^10と (\d+)で いくつ？$/.exec(q.prompt))) {
          expect(q.answer).toBe(String(10 + Number(m[1])))
        } else if ((m = /^(\d+)は 10と いくつ？$/.exec(q.prompt))) {
          expect(q.answer).toBe(String(Number(m[1]) - 10))
        } else if ((m = /^10と □で (\d+)$/.exec(q.prompt))) {
          expect(q.answer).toBe(String(Number(m[1]) - 10))
          expect(v.hideOnes).toBe(true)
        } else {
          throw new Error(`未知の出題形式: ${q.prompt}`)
        }
        // ばらの数は答え/問題と整合
        expect(v.ones).toBeGreaterThanOrEqual(1)
        expect(v.ones).toBeLessThanOrEqual(9)
      }
    }
  })
})

describe('ステージ5: かずの ならび', () => {
  it('数列は単調増加で、□に答えを入れると成立する', () => {
    for (const lv of LEVELS) {
      for (const q of many(5, lv)) {
        const v = q.visual as V<'sequence'>
        const filled = v.numbers.map((n) => (n === null ? Number(q.answer) : n))
        for (let i = 1; i < filled.length; i++) {
          expect(filled[i], `減少している: ${filled.join(',')}`).toBeGreaterThanOrEqual(filled[i - 1])
        }
        expect(v.numbers.filter((n) => n === null).length).toBe(1)
      }
    }
  })
})

describe('ステージ6: たしざん その1（くり上がりなし）', () => {
  it('a+b が 9 以下で、答えは a+b', () => {
    for (const lv of LEVELS) {
      for (const q of many(6, lv)) {
        const m = /^(\d+) \+ (\d+) = \?$/.exec(q.prompt)
        expect(m, `式の形式: ${q.prompt}`).not.toBeNull()
        const [a, b] = [Number(m![1]), Number(m![2])]
        expect(a + b).toBeLessThanOrEqual(9) // くり上がりなし
        expect(q.answer).toBe(String(a + b))
      }
    }
  })
})

describe('ステージ7: ひきざん その1（くり下がりなし）', () => {
  it('b < a ≤ 10 で、答えは a-b', () => {
    for (const lv of LEVELS) {
      for (const q of many(7, lv)) {
        const v = q.visual as V<'subBlocks'>
        expect(v.b).toBeLessThan(v.a)
        expect(v.a).toBeLessThanOrEqual(10)
        expect(q.answer).toBe(String(v.a - v.b))
      }
    }
  })
})

describe('ステージ8: 10を つくろう', () => {
  it('答えは 10 の補数', () => {
    for (const lv of LEVELS) {
      for (const q of many(8, lv)) {
        const v = q.visual as V<'makeTen'>
        expect(q.answer).toBe(String(10 - v.filled))
      }
    }
  })
})

describe('ステージ9: たしざん その2（くり上がりあり）', () => {
  it('1けた同士・和は 11〜18 で、くり上がりが必ず起きる', () => {
    for (const lv of LEVELS) {
      for (const q of many(9, lv)) {
        const m = /^(\d+) \+ (\d+) = \?$/.exec(q.prompt)
        expect(m).not.toBeNull()
        const [a, b] = [Number(m![1]), Number(m![2])]
        expect(a).toBeLessThanOrEqual(9)
        expect(b).toBeLessThanOrEqual(9)
        expect(a + b).toBeGreaterThanOrEqual(11)
        expect(a + b).toBeLessThanOrEqual(18)
        expect(q.answer).toBe(String(a + b))
      }
    }
  })
})

describe('ステージ10: ひきざん その2（くり下がりあり）', () => {
  it('a は 11〜18、くり下がりが必ず起きる（b > 1のくらい）', () => {
    for (const lv of LEVELS) {
      for (const q of many(10, lv)) {
        const m = /^(\d+) - (\d+) = \?$/.exec(q.prompt)
        expect(m).not.toBeNull()
        const [a, b] = [Number(m![1]), Number(m![2])]
        expect(a).toBeGreaterThanOrEqual(11)
        expect(a).toBeLessThanOrEqual(18)
        expect(b).toBeGreaterThan(a - 10) // ばらだけでは引けない ＝ くり下がり必須
        expect(b).toBeLessThanOrEqual(9)
        expect(q.answer).toBe(String(a - b))
      }
    }
  })
})

describe('ステージ12: ながさ・ひろさ・かさ', () => {
  it('左右は同じ大きさにならず、highlight は答えと一致する', () => {
    for (const lv of LEVELS) {
      for (const q of many(12, lv)) {
        const v = q.visual as V<'measure'>
        expect(v.left).not.toBe(v.right)
        expect(v.highlight).toBe(q.answer)
        // ことばと答えの整合（ながい/ひろい/おおい → 大きい側）
        const askBig = /ながい|ひろい|おおい/.test(q.prompt)
        const expected = askBig ? (v.left > v.right ? 'left' : 'right') : v.left < v.right ? 'left' : 'right'
        expect(q.answer).toBe(expected)
      }
    }
  })
})

describe('ステージ13: とけい', () => {
  const VALID_MINUTES = new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55])
  it('時刻の形式・範囲が正しく、正解の表記が選択肢にある', () => {
    for (const lv of LEVELS) {
      for (const q of many(13, lv)) {
        const m = /^(\d+):(\d+)$/.exec(q.answer)
        expect(m, `answer形式: ${q.answer}`).not.toBeNull()
        const [h, mi] = [Number(m![1]), Number(m![2])]
        expect(h).toBeGreaterThanOrEqual(1)
        expect(h).toBeLessThanOrEqual(12)
        expect(VALID_MINUTES.has(mi), `分が5きざみでない: ${mi}`).toBe(true)
        const v = q.visual as V<'clock'>
        expect(v.hour).toBe(h)
        expect(v.minute).toBe(mi)
      }
    }
  })
  it('レベル1は「ちょうど」だけ、5分きざみはレベル3のみ', () => {
    for (const q of many(13, 1)) {
      expect(q.answer.endsWith(':0')).toBe(true)
    }
    for (const q of many(13, 2)) {
      const mi = Number(q.answer.split(':')[1])
      expect([0, 30]).toContain(mi)
    }
  })
})

describe('ステージ14: えグラフ', () => {
  it('いちばん多い/少ない を再計算すると答えと一致する', () => {
    for (const lv of LEVELS) {
      for (const q of many(14, lv)) {
        const v = q.visual as V<'pictograph'>
        const askMost = q.prompt.includes('おおい')
        const target = v.rows.reduce((best, r) =>
          askMost ? (r.count > best.count ? r : best) : r.count < best.count ? r : best
        )
        expect(q.answer).toBe(target.label)
        // 個数がかぶって答えが2つにならないこと
        const counts = v.rows.map((r) => r.count)
        expect(new Set(counts).size).toBe(counts.length)
      }
    }
  })
})

// --- セット生成・ふくしゅう生成 ----------------------------------------------
describe('generateQuestions / generateReviewQuestions', () => {
  it('各ステージで5問生成され、すべて有効', () => {
    for (const id of STAGE_IDS) {
      const qs = generateQuestions(id, 5, 2)
      expect(qs.length).toBe(5)
      for (const q of qs) expect(choiceValues(q)).toContain(q.answer)
    }
  })
  it('ふくしゅうは苦手ステージだけから出題される', () => {
    for (let i = 0; i < 50; i++) {
      const entries = [
        { stageId: 6, level: 2, weight: 3 },
        { stageId: 13, level: 1, weight: 1 },
      ]
      const { questions, stageIds } = generateReviewQuestions(entries, 5)
      expect(questions.length).toBe(5)
      expect(stageIds.length).toBeGreaterThanOrEqual(1)
      for (const id of stageIds) expect([6, 13]).toContain(id)
      for (const q of questions) expect(choiceValues(q)).toContain(q.answer)
    }
  })
})
