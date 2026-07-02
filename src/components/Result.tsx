import { useEffect } from 'react'
import type { StageMeta } from '../types'
import type { BadgeMeta } from '../data/badges'
import { playClear, playWrong, speakAuto } from '../utils/audio'

// ==========================================================================
// クリア（けっか）画面
// せいかい数・スター・つぎへ・もういちど・ホーム
// isReview のときは「ふくしゅう」用の 表示（スターなし・前向きな ことば）
// ==========================================================================

type Props = {
  stage: StageMeta
  correct: number
  total: number
  stars: number
  cleared: boolean
  /** 難易度が あがったか（つぎの プレイから むずかしくなる） */
  leveledUp: boolean
  /** いまの（つぎに つかう）難易度レベル */
  newLevel: number
  hasNext: boolean
  /** ホームからの「ふくしゅう」セッションの けっかか */
  isReview?: boolean
  /** きょうのチャレンジの けっかか */
  isDaily?: boolean
  /** きょうのチャレンジの れんぞく日数（isDaily のとき ひょうじ） */
  streak?: number
  /** このプレイで あたらしく かくとくした バッジ */
  newBadges?: BadgeMeta[]
  onNext: () => void
  onReplay: () => void
  onHome: () => void
}

export function Result({
  stage,
  correct,
  total,
  stars,
  cleared,
  leveledUp,
  newLevel,
  hasNext,
  isReview = false,
  isDaily = false,
  streak = 0,
  newBadges = [],
  onNext,
  onReplay,
  onHome,
}: Props) {
  // けっか画面が でたら 音で しらせる（クリアは ファンファーレ）
  useEffect(() => {
    if (isDaily) {
      if (cleared) {
        playClear()
        window.setTimeout(() => speakAuto('チャレンジ クリア！'), 700)
      } else {
        playWrong()
        window.setTimeout(() => speakAuto('また チャレンジしてね！'), 300)
      }
    } else if (isReview) {
      // ふくしゅうは いつでも 前向きに
      playClear()
      window.setTimeout(() => speakAuto(cleared ? 'ふくしゅう ばっちり！' : 'よく がんばったね！'), 700)
    } else if (cleared) {
      playClear()
      window.setTimeout(() => speakAuto(leveledUp ? 'クリア！ レベルアップ！' : 'クリア！ おめでとう！'), 700)
    } else {
      playWrong()
      window.setTimeout(() => speakAuto('もういちど チャレンジ！'), 300)
    }
    if (newBadges.length > 0) {
      window.setTimeout(() => speakAuto('バッジ ゲット！'), 1600)
    }
    // マウント時に 1かいだけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const title = isDaily
    ? cleared
      ? 'チャレンジ クリア！'
      : 'おしい！ また チャレンジ！'
    : isReview
      ? cleared
        ? 'ふくしゅう ばっちり！'
        : 'よく がんばったね！'
      : cleared
        ? 'クリア！ おめでとう！'
        : 'おしい！ もうすこし！'

  return (
    <div className="result" style={{ ['--accent' as string]: stage.color }}>
      {cleared && (
        <div className="confetti" aria-hidden>
          {['🎉', '⭐', '🎈', '✨', '🌟', '🎊', '🍬', '💫'].map((e, i) => (
            <span key={i} className="confetti-piece" style={{ left: `${(i * 12 + 4) % 100}%`, animationDelay: `${i * 120}ms` }}>
              {e}
            </span>
          ))}
        </div>
      )}

      <div className="card result-card">
        <div className="result-face">
          {isDaily ? (cleared ? '🌞' : '💪') : isReview ? (cleared ? '🌟' : '💪') : cleared ? '🏆' : '💪'}
        </div>
        <h2 className="result-title">{title}</h2>

        <p className="result-score">
          {total}もん ちゅう <b>{correct}</b>もん せいかい
        </p>

        {isDaily && cleared && streak >= 1 && (
          <div className="streak-banner pop">
            🔥 れんぞく <b>{streak}</b>にち！{streak >= 2 ? ' すごい！' : ' あしたも やってみよう！'}
          </div>
        )}

        {!isReview && !isDaily && (
          <div className="result-stars">
            {[1, 2, 3].map((n) => (
              <span key={n} className={n <= stars ? 'big-star on pop' : 'big-star'} style={{ animationDelay: `${n * 150}ms` }}>
                ★
              </span>
            ))}
          </div>
        )}

        {leveledUp && (
          <div className="levelup pop">
            ⬆️ レベルアップ！<span>つぎは レベル {newLevel}。もうすこし むずかしくなるよ！</span>
          </div>
        )}

        {newBadges.map((b, i) => (
          <div key={b.id} className="badge-get pop" style={{ animationDelay: `${500 + i * 300}ms` }}>
            🎉 バッジ ゲット！
            <span className="badge-get-item">
              {b.emoji} {b.name}
            </span>
          </div>
        ))}

        {isDaily ? (
          !cleared && (
            <p className="result-msg">
              {Math.ceil(total * 0.8)}もん せいかいで クリアだよ。なんかいでも チャレンジできるよ！
            </p>
          )
        ) : isReview ? (
          <p className="result-msg">
            {cleared ? 'にがてが へったよ！ このちょうし！' : 'まちがえても だいじょうぶ。すこしずつ おぼえよう！'}
          </p>
        ) : (
          !cleared && (
            <p className="result-msg">
              {Math.ceil(total * 0.8)}もん せいかいで クリアだよ。もういちど チャレンジ！
            </p>
          )
        )}

        <div className="result-btns">
          {cleared && hasNext && (
            <button className="btn btn-big btn-next" onClick={onNext}>
              つぎの ステージへ ▶
            </button>
          )}
          <button className="btn btn-big" onClick={onReplay}>
            {isDaily ? '🌞 もういちど あそぶ' : isReview ? '💪 もういちど ふくしゅう' : '🔁 もういちど'}
          </button>
          <button className="btn btn-ghost" onClick={onHome}>
            🏠 ホームへ
          </button>
        </div>
      </div>
    </div>
  )
}
