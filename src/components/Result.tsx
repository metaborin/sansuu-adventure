import type { StageMeta } from '../types'

// ==========================================================================
// クリア（けっか）画面
// せいかい数・スター・つぎへ・もういちど・ホーム
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
  onNext,
  onReplay,
  onHome,
}: Props) {
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
        <div className="result-face">{cleared ? '🏆' : '💪'}</div>
        <h2 className="result-title">{cleared ? 'クリア！ おめでとう！' : 'おしい！ もうすこし！'}</h2>

        <p className="result-score">
          {total}もん ちゅう <b>{correct}</b>もん せいかい
        </p>

        <div className="result-stars">
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= stars ? 'big-star on pop' : 'big-star'} style={{ animationDelay: `${n * 150}ms` }}>
              ★
            </span>
          ))}
        </div>

        {leveledUp && (
          <div className="levelup pop">
            ⬆️ レベルアップ！<span>つぎは レベル {newLevel}。もうすこし むずかしくなるよ！</span>
          </div>
        )}

        {!cleared && <p className="result-msg">4もん せいかいで クリアだよ。もういちど チャレンジ！</p>}

        <div className="result-btns">
          {cleared && hasNext && (
            <button className="btn btn-big btn-next" onClick={onNext}>
              つぎの ステージへ ▶
            </button>
          )}
          <button className="btn btn-big" onClick={onReplay}>
            🔁 もういちど
          </button>
          <button className="btn btn-ghost" onClick={onHome}>
            🏠 ホームへ
          </button>
        </div>
      </div>
    </div>
  )
}
