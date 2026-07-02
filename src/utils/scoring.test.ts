import { describe, expect, it } from 'vitest'
import { clearThreshold, defaultSettings, loadSettings, nextLevel, starsForCorrect } from './storage'

// ==========================================================================
// スコア計算（問題数 5/10 対応）と設定のテスト
// ==========================================================================

describe('clearThreshold（クリアに必要な正解数 = 8わり）', () => {
  it('5問なら4問、10問なら8問', () => {
    expect(clearThreshold(5)).toBe(4)
    expect(clearThreshold(10)).toBe(8)
  })
})

describe('starsForCorrect', () => {
  it('5問モード: 5問=⭐3, 4問=⭐2, 3問以下=0', () => {
    expect(starsForCorrect(5, 5)).toBe(3)
    expect(starsForCorrect(4, 5)).toBe(2)
    expect(starsForCorrect(3, 5)).toBe(0)
    expect(starsForCorrect(0, 5)).toBe(0)
  })
  it('10問モード: 10問=⭐3, 8〜9問=⭐2, 7問以下=0', () => {
    expect(starsForCorrect(10, 10)).toBe(3)
    expect(starsForCorrect(9, 10)).toBe(2)
    expect(starsForCorrect(8, 10)).toBe(2)
    expect(starsForCorrect(7, 10)).toBe(0)
  })
  it('total 省略時は 5問あつかい（後方互換）', () => {
    expect(starsForCorrect(5)).toBe(3)
    expect(starsForCorrect(4)).toBe(2)
  })
})

describe('nextLevel（難易度の自動調整）', () => {
  it('5問モード: 全問でアップ、2問以下でダウン', () => {
    expect(nextLevel(1, 5, 5)).toBe(2)
    expect(nextLevel(2, 2, 5)).toBe(1)
    expect(nextLevel(2, 3, 5)).toBe(2) // そのまま
    expect(nextLevel(3, 5, 5)).toBe(3) // 上限
    expect(nextLevel(1, 0, 5)).toBe(1) // 下限
  })
  it('10問モード: 全問でアップ、4問以下でダウン', () => {
    expect(nextLevel(1, 10, 10)).toBe(2)
    expect(nextLevel(2, 4, 10)).toBe(1)
    expect(nextLevel(2, 5, 10)).toBe(2) // そのまま
    expect(nextLevel(2, 9, 10)).toBe(2) // 9/10 では上がらない
  })
})

describe('settings', () => {
  it('デフォルトは 5問・自動調整オン', () => {
    expect(defaultSettings()).toEqual({ questionsPerStage: 5, adaptiveDifficulty: true })
  })
  it('localStorage が使えない環境でもデフォルトを返す', () => {
    // Node 環境（localStorage なし）で例外にならず デフォルトが返る
    expect(loadSettings()).toEqual(defaultSettings())
  })
})
