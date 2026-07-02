import type { AppSettings, Progress } from '../types'
import { STAGES } from '../data/stages'
import { BADGES } from '../data/badges'
import { clearedCount, totalStars } from '../utils/storage'

// ==========================================================================
// せんせい・ほごしゃ ページ
// ・せいせき一覧（ステージごとの クリア/最高正解/スター/レベル/にがて）
// ・せってい（問題数・難易度の自動調整・レベルをそろえる）
// ・すべてかいほう / しんちょくリセット
// ==========================================================================

type Props = {
  progress: Progress
  settings: AppSettings
  onChangeSettings: (next: AppSettings) => void
  onSetAllLevels: (level: number) => void
  onUnlockAll: () => void
  onReset: () => void
  onBack: () => void
}

export function Teacher({
  progress,
  settings,
  onChangeSettings,
  onSetAllLevels,
  onUnlockAll,
  onReset,
  onBack,
}: Props) {
  const stars = totalStars(progress)
  const cleared = clearedCount(progress)

  return (
    <div className="teacher-screen">
      <div className="game-top">
        <button className="btn btn-round" onClick={onBack} aria-label="ホームへ もどる">
          🏠
        </button>
        <div className="game-title">📋 せいせき・せってい</div>
        <div className="game-count">👨‍👩‍👧</div>
      </div>

      {/* --- まとめ ----------------------------------------------------- */}
      <div className="teacher-chips">
        <span className="teacher-chip">⭐ スター {stars}</span>
        <span className="teacher-chip">
          🏁 クリア {cleared}/{STAGES.length}
        </span>
        <span className="teacher-chip">
          🏅 バッジ {progress.badges.length}/{BADGES.length}
        </span>
        <span className="teacher-chip">🔥 れんぞく {progress.daily.streak}にち</span>
        <span className="teacher-chip">💪 ふくしゅう {progress.reviewClears}かい</span>
      </div>

      {/* --- せいせき一覧 ------------------------------------------------ */}
      <div className="card teacher-section">
        <h2 className="teacher-heading">せいせき一覧</h2>
        <table className="teacher-table">
          <thead>
            <tr>
              <th>ステージ</th>
              <th>クリア</th>
              <th>さいこう</th>
              <th>スター</th>
              <th>レベル</th>
              <th>にがて</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => {
              const sp = progress.stages[s.id]
              return (
                <tr key={s.id}>
                  <td className="teacher-stage">
                    {s.id}. {s.emoji} {s.title}
                  </td>
                  <td>{sp?.cleared ? '✅' : '—'}</td>
                  <td>{sp?.bestCorrect ?? 0}もん</td>
                  <td>{'★'.repeat(sp?.stars ?? 0) || '—'}</td>
                  <td>Lv{sp?.level ?? 1}</td>
                  <td>{sp && sp.misses > 0 ? `${sp.misses}` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="teacher-note">
          「さいこう」は これまでの 最高正解数、「にがて」は 直近プレイで まちがえた数（ふくしゅうの 出題もと）です。
        </p>
      </div>

      {/* --- せってい ---------------------------------------------------- */}
      <div className="card teacher-section">
        <h2 className="teacher-heading">せってい</h2>

        <div className="setting-row">
          <span className="setting-label">1回の 問題数</span>
          <div className="seg">
            <button
              className={settings.questionsPerStage === 5 ? 'on' : ''}
              onClick={() => onChangeSettings({ ...settings, questionsPerStage: 5 })}
            >
              5もん
            </button>
            <button
              className={settings.questionsPerStage === 10 ? 'on' : ''}
              onClick={() => onChangeSettings({ ...settings, questionsPerStage: 10 })}
            >
              10もん
            </button>
          </div>
        </div>
        <p className="teacher-note">クリア基準は 8わり（5問なら4問、10問なら8問）に 自動で 合わせます。</p>

        <div className="setting-row">
          <span className="setting-label">難易度の 自動調整</span>
          <div className="seg">
            <button
              className={settings.adaptiveDifficulty ? 'on' : ''}
              onClick={() => onChangeSettings({ ...settings, adaptiveDifficulty: true })}
            >
              オン
            </button>
            <button
              className={!settings.adaptiveDifficulty ? 'on' : ''}
              onClick={() => onChangeSettings({ ...settings, adaptiveDifficulty: false })}
            >
              オフ（固定）
            </button>
          </div>
        </div>
        <p className="teacher-note">オフに すると、成績で レベルが 変わらなくなります（下の ボタンで そろえられます）。</p>

        <div className="setting-row">
          <span className="setting-label">レベルを そろえる</span>
          <div className="seg">
            {[1, 2, 3].map((lv) => (
              <button key={lv} onClick={() => onSetAllLevels(lv)}>
                Lv{lv}
              </button>
            ))}
          </div>
        </div>

        <div className="teacher-danger">
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
