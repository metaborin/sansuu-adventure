import type { StageMeta } from '../types'

// ==========================================================================
// ステージ定義（配列データ）
// じゅんばんに ならんでいます。上から順に解放されていきます。
// 新しいステージを増やしたいときは、この配列に追加して、
// src/questions に問題生成を1つ足すだけでOKです。
// ==========================================================================

export const STAGES: StageMeta[] = [
  {
    id: 1,
    title: 'かずを かぞえよう',
    emoji: '🍎',
    color: '#ff6b6b',
    goal: '1〜10 の かずを かぞえる',
    featured: true,
  },
  {
    id: 2,
    title: 'どちらが おおい？',
    emoji: '⚖️',
    color: '#ff922b',
    goal: 'かずの おおい・すくないを くらべる',
    featured: true,
  },
  {
    id: 3,
    title: 'なんばんめ？',
    emoji: '🚂',
    color: '#fcc419',
    goal: 'まえから・うしろから の じゅんばん',
    featured: false,
  },
  {
    id: 4,
    title: '10の まとまり',
    emoji: '🔟',
    color: '#94d82d',
    goal: '「10と いくつ」で 11〜20',
    featured: false,
  },
  {
    id: 5,
    title: 'かずの ならび',
    emoji: '🔢',
    color: '#51cf66',
    goal: 'ぬけている かずを みつける',
    featured: false,
  },
  {
    id: 6,
    title: 'たしざん その1',
    emoji: '➕',
    color: '#20c997',
    goal: 'くりあがりの ない たしざん',
    featured: true,
  },
  {
    id: 7,
    title: 'ひきざん その1',
    emoji: '➖',
    color: '#22b8cf',
    goal: 'くりさがりの ない ひきざん',
    featured: true,
  },
  {
    id: 8,
    title: '10を つくろう',
    emoji: '🤝',
    color: '#339af0',
    goal: '10の あわせ・わけ（10の ほすう）',
    featured: true,
  },
  {
    id: 9,
    title: 'たしざん その2',
    emoji: '✨',
    color: '#4c6ef5',
    goal: 'くりあがりの ある たしざん',
    featured: false,
  },
  {
    id: 10,
    title: 'ひきざん その2',
    emoji: '🌟',
    color: '#7048e8',
    goal: 'くりさがりの ある ひきざん',
    featured: false,
  },
  {
    id: 11,
    title: 'かたちを みつけよう',
    emoji: '🔺',
    color: '#be4bdb',
    goal: 'まる・さんかく・しかく',
    featured: true,
  },
  {
    id: 12,
    title: 'ながさ・ひろさ・かさ',
    emoji: '📏',
    color: '#e64980',
    goal: 'ながい・ひろい・おおいを くらべる',
    featured: false,
  },
  {
    id: 13,
    title: 'とけいを よもう',
    emoji: '🕐',
    color: '#f06595',
    goal: '「なんじ」を よむ',
    featured: false,
  },
  {
    id: 14,
    title: 'えグラフを よもう',
    emoji: '📊',
    color: '#fa5252',
    goal: 'えグラフで かずを くらべる',
    featured: false,
  },
]

/** ステージIDから情報を引く便利関数 */
export function getStage(id: number): StageMeta | undefined {
  return STAGES.find((s) => s.id === id)
}
