import type { Progress } from '../types'
import { STAGES } from '../data/stages'
import { clearedCount, isStageUnlocked, totalStars } from '../utils/storage'

// ==========================================================================
// ホーム画面 ＋ ステージ選択
// タイトル・進捗・スター・「はじめる」「すべて解放」「リセット」・ステージ一覧
// ==========================================================================

type Props = {
  progress: Progress
  soundOn: boolean
  onToggleSound: () => void
  onStart: (stageId: number) => void
  onUnlockAll: () => void
  onReset: () => void
}

export function Home({ progress, soundOn, onToggleSound, onStart, onUnlockAll, onReset }: Props) {
  const stars = totalStars(progress)
  const cleared = clearedCount(progress)

  // 「はじめる」で すすむ ステージ ＝ まだ クリアして いない いちばん さいしょの 解放ステージ
  const nextStage =
    STAGES.find((s) => isStageUnlocked(progress, s.id) && !progress.stages[s.id]?.cleared) ?? STAGES[0]

  return (
    <div className="home">
      <header className="home-head">
        <button
          className="btn btn-round sound-toggle"
          onClick={onToggleSound}
          aria-label={soundOn ? 'おとを けす' : 'おとを つける'}
          title={soundOn ? 'おとを けす' : 'おとを つける'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <div className="home-badge">🎒</div>
        <h1 className="title">
          さんすうアドベンチャー
          <span className="title-sub">1ねんせい</span>
        </h1>
      </header>

      <div className="summary">
        <div className="summary-item">
          <span className="summary-num">⭐ {stars}</span>
          <span className="summary-cap">スター</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">🏁 {cleared} / {STAGES.length}</span>
          <span className="summary-cap">クリア</span>
        </div>
      </div>

      <button className="btn btn-big btn-start" onClick={() => onStart(nextStage.id)}>
        ▶ ステージ {nextStage.id} を はじめる
      </button>

      <div className="stage-grid">
        {STAGES.map((s) => {
          const unlocked = isStageUnlocked(progress, s.id)
          const sp = progress.stages[s.id]
          return (
            <button
              key={s.id}
              className={`stage-card ${unlocked ? '' : 'locked'} ${sp?.cleared ? 'cleared' : ''}`}
              style={{ ['--accent' as string]: s.color }}
              onClick={() => unlocked && onStart(s.id)}
              disabled={!unlocked}
              aria-label={`ステージ${s.id} ${s.title}`}
            >
              <div className="stage-no">{s.id}</div>
              {unlocked && sp && sp.level > 1 && <div className="stage-level">Lv{sp.level}</div>}
              <div className="stage-emoji">{unlocked ? s.emoji : '🔒'}</div>
              <div className="stage-title">{s.title}</div>
              <div className="stage-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= (sp?.stars ?? 0) ? 'star on' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="grown-up">
        <p className="grown-up-note">👨‍👩‍👧 おうちの ひと・せんせい むけ</p>
        <div className="grown-up-btns">
          <button className="btn btn-ghost" onClick={onUnlockAll}>
            🔓 すべて かいほう
          </button>
          <button className="btn btn-ghost" onClick={onReset}>
            🔄 しんちょくを リセット
          </button>
        </div>
      </div>
    </div>
  )
}
