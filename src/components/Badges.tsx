import type { Progress } from '../types'
import { BADGES } from '../data/badges'

// ==========================================================================
// バッジずかん
// かくとく済み → カラーで ひょうじ ／ みかくとく → ❓と ヒントだけ
// ==========================================================================

type Props = {
  progress: Progress
  onBack: () => void
}

export function BadgeBook({ progress, onBack }: Props) {
  const owned = new Set(progress.badges)

  return (
    <div className="badges-screen">
      <div className="game-top">
        <button className="btn btn-round" onClick={onBack} aria-label="ホームへ もどる">
          🏠
        </button>
        <div className="game-title">🏅 バッジずかん</div>
        <div className="game-count">
          {owned.size}/{BADGES.length}
        </div>
      </div>

      <p className="badges-note">バッジを あつめて、ずかんを かんせい させよう！</p>

      <div className="badge-grid">
        {BADGES.map((b, i) => {
          const got = owned.has(b.id)
          return (
            <div
              key={b.id}
              className={`badge-card pop ${got ? 'got' : 'locked'}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="badge-emoji">{got ? b.emoji : '❓'}</div>
              <div className="badge-name">{got ? b.name : '？？？'}</div>
              <div className="badge-how">{b.how}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
