// ==========================================================================
// 型定義
// アプリ全体で使う型をここにまとめています。
// ==========================================================================

/** えらぶボタン1つ分のデータ */
export interface Choice {
  /** ボタンに表示する文字（すうじ・えもじ・ことば） */
  label: string
  /** せいかいかどうかを判定するための値 */
  value: string
}

/** かずのグループ（えもじ と こすう） */
export interface Group {
  emoji: string
  count: number
}

/**
 * 問題ごとの「見た目（イラスト・ブロックなど）」をあらわすデータ。
 * kind によって描画するコンポーネントを切りかえます。
 * 新しい見た目を追加したいときは、ここに 1 つ足して Visual.tsx に描画を追加します。
 */
export type Visual =
  | { kind: 'objects'; emoji: string; count: number }
  | { kind: 'compare'; left: Group; right: Group }
  | {
      kind: 'ordinalRow'
      items: string[]
      targetIndex: number
      /** 両はしの ことば（[ひだり側, みぎ側]）。例：['まえ','うしろ'] や ['ひだり','みぎ'] */
      ends: [string, string]
      /** どちら側から かぞえるか（矢印の 表示用） */
      countFrom: 'left' | 'right'
    }
  | { kind: 'tenAndOnes'; ones: number; hideOnes?: boolean }
  | { kind: 'sequence'; numbers: (number | null)[] }
  | { kind: 'addBlocks'; a: number; b: number; emoji: string }
  | { kind: 'subBlocks'; a: number; b: number; emoji: string }
  | { kind: 'makeTen'; filled: number }
  | { kind: 'addCarry'; a: number; b: number }
  | { kind: 'subBorrow'; a: number; b: number }
  | { kind: 'shapeObject'; emoji: string }
  | {
      kind: 'measure'
      variant: 'length' | 'area' | 'volume'
      left: number
      right: number
      /** せいかいの がわ（こたえ合わせ後に ひからせる） */
      highlight?: 'left' | 'right'
    }
  | { kind: 'clock'; hour: number; minute: number }
  | { kind: 'pictograph'; rows: { label: string; emoji: string; count: number }[] }
  | { kind: 'none' }

/** 1問分のデータ */
export interface Question {
  id: string
  /** 問題文（みじかく・ひらがな中心） */
  prompt: string
  /** 見た目（イラスト・ブロックなど） */
  visual: Visual
  /** えらぶボタン */
  choices: Choice[]
  /**
   * えらぶボタンの ならべかた。
   * 'row' … よこ1れつ（「ひだり・おなじ・みぎ」のような いちを あらわす 3たくむき）
   * それいがい（未指定）… 2れつ グリッド（すうじの 4たくなど）
   */
  choiceLayout?: 'grid' | 'row'
  /** せいかいの value */
  answer: string
  /**
   * まちがえたときに出す「段階ヒント」。
   * 1回目のまちがい → hints[0]（やさしいナッジ）
   * 2回目いこう     → hints[1]…（より具体的）
   * 配列は 1つ以上。少なくとも 2つ用意すると段階的になります。
   */
  hints: string[]
}

/** ステージの基本情報（一覧に表示する用） */
export interface StageMeta {
  id: number
  /** タイトル（ひらがな） */
  title: string
  emoji: string
  /** カードのいろ（アクセントカラー） */
  color: string
  /** なにを学ぶかの短い説明 */
  goal: string
  /** じっそう済みか（MVP でしっかり作ったか）。false でも簡易版で遊べます */
  featured: boolean
}

/** 1ステージ分の進捗 */
export interface StageProgress {
  cleared: boolean
  /** これまでの最高正解数（0〜5） */
  bestCorrect: number
  /** このステージで獲得したスター（0〜3） */
  stars: number
  /**
   * 難易度レベル（1〜3）。直近の成績で自動調整する。
   * 全問正解でレベルアップ、2問以下でレベルダウン。
   */
  level: number
  /**
   * 直近のプレイで「1回めに まちがえた」問題の数（0〜5）。
   * ホームの「ふくしゅう」の出題もとになる。ふくしゅうで 4問以上できたら 0 に戻る。
   */
  misses: number
}

/** localStorage に保存する進捗データ全体 */
export interface Progress {
  /** データ形式のバージョン（形式を変えたら数字を上げる） */
  version: number
  /** ステージID => 進捗 */
  stages: Record<number, StageProgress>
  /** せんせい・ほごしゃ用「すべて解放」がおされたか */
  unlockedAll: boolean
}
