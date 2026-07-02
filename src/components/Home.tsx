import type { Progress } from '../types'
import { STAGES } from '../data/stages'
import { BADGES } from '../data/badges'
import { clearedCount, isStageUnlocked, todayKey, totalStars } from '../utils/storage'

// ==========================================================================
// ホーム画面 ＋ ステージ選択
// タイトル・進捗・スター・「はじめる」「すべて解放」「リセット」・ステージ一覧
// ==========================================================================

type Props = {
  progress: Progress
  soundOn: boolean
  speechOn: boolean
  onToggleSound: () => void
  onToggleSpeech: () => void
  onStart: (stageId: number) => void
  onStartReview: () => void
  onStartDaily: () => void
  onOpenBadges: () => void
  onOpenTeacher: () => void
}

export function Home({
  progress,
  soundOn,
  speechOn,
  onToggleSound,
  onToggleSpeech,
  onStart,
  onStartReview,
  onStartDaily,
  onOpenBadges,
  onOpenTeacher,
}: Props) {
  const stars = totalStars(progress)
  const cleared = clearedCount(progress)

  // 「はじめる」で すすむ ステージ ＝ まだ クリアして いない いちばん さいしょの 解放ステージ
  const nextStage =
    STAGES.find((s) => isStageUnlocked(progress, s.id) && !progress.stages[s.id]?.cleared) ?? STAGES[0]

  // ふくしゅうが ある？（1回めで まちがえた 問題が のこっている ステージ）
  const missTotal = STAGES.reduce((sum, s) => sum + (progress.stages[s.id]?.misses ?? 0), 0)

  // きょうのチャレンジは クリアずみ？
  const dailyDone = progress.daily.lastClearDate === todayKey()
  const streak = progress.daily.streak

  return (
    <div className="home">
      <header className="home-head">
        <button
          className="btn btn-round sound-toggle"
          onClick={onToggleSound}
          aria-label={soundOn ? 'おと（BGM・こうかおん）を けす' : 'おとを つける'}
          title={soundOn ? 'おと（BGM・こうかおん）を けす' : 'おとを つける'}
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
        <button className="summary-item summary-btn" onClick={onOpenBadges} aria-label="バッジずかんを ひらく">
          <span className="summary-num">
            🏅 {progress.badges.length}/{BADGES.length}
          </span>
          <span className="summary-cap">バッジずかん ▶</span>
        </button>
      </div>

      <button className="btn btn-big btn-start" onClick={() => onStart(nextStage.id)}>
        ▶ ステージ {nextStage.id} を はじめる
      </button>

      <button
        className={`daily-card ${dailyDone ? 'done' : ''}`}
        onClick={onStartDaily}
        aria-label="きょうのチャレンジを はじめる"
      >
        <span className="daily-emoji">{dailyDone ? '✅' : '🌞'}</span>
        <span className="daily-text">
          きょうの チャレンジ
          <small>{dailyDone ? 'きょうは クリアずみ！ すごい！' : 'まいにち 1かい、ミックス 5もん'}</small>
        </span>
        {streak > 0 && <span className="daily-streak">🔥{streak}</span>}
      </button>

      {missTotal > 0 && (
        <button className="review-card" onClick={onStartReview} aria-label="にがてな もんだいを ふくしゅうする">
          <span className="review-emoji">💪</span>
          <span className="review-text">
            ふくしゅうしよう！
            <small>まちがえた もんだいに もういちど チャレンジ</small>
          </span>
        </button>
      )}

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
          <button className="btn btn-ghost" onClick={onToggleSound}>
            {soundOn ? '🔊' : '🔇'} BGM・こうかおん：{soundOn ? 'オン' : 'オフ'}
          </button>
          <button className="btn btn-ghost" onClick={onToggleSpeech}>
            {speechOn ? '🗣️' : '💤'} じどう よみあげ：{speechOn ? 'オン' : 'オフ'}
          </button>
        </div>
        <p className="grown-up-hint">
          ※ よみあげは はじめ オフです。もんだい画面の 🔊 ボタンで いつでも 読み上げできます。
        </p>
        <div className="grown-up-btns">
          <button className="btn btn-ghost" onClick={onOpenTeacher}>
            📋 せいせき・せってい（かいほう・リセットも こちら）
          </button>
        </div>
      </div>
    </div>
  )
}
