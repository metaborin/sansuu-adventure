import { useEffect, useMemo, useState } from 'react'
import type { StageMeta } from '../types'
import { generateQuestions } from '../questions'
import { VisualView } from './Visual'
import { playCorrect, playTap, playWrong, speak, stopSpeak } from '../utils/audio'

// ==========================================================================
// 問題画面（1ステージ ＝ 5問）
// ・えらぶ → せいかい なら「つぎへ」/ まちがい なら やさしく ヒント（何回でも やりなおせる）
// ・スコアは「1回めで せいかい できた 数」で つける（成功体験を おおく）
// ==========================================================================

const QUESTIONS_PER_STAGE = 5

type Props = {
  stage: StageMeta
  /** 難易度レベル（1〜3）。出題の むずかしさが 変わる */
  level: number
  soundOn: boolean
  onToggleSound: () => void
  onFinish: (correct: number) => void
  onQuit: () => void
}

export function Game({ stage, level, soundOn, onToggleSound, onFinish, onQuit }: Props) {
  // 5問を さいしょに 作って おく（このコンポーネントが 生きている あいだは 変わらない）
  const questions = useMemo(
    () => generateQuestions(stage.id, QUESTIONS_PER_STAGE, level),
    [stage.id, level]
  )

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false) // 連打ぼうし

  const q = questions[index]
  const isLast = index === questions.length - 1

  // あたらしい 問題に なったら、問題文を 読み上げる（おとが オンのとき・ベストエフォート）
  useEffect(() => {
    speak(q.prompt)
    return () => stopSpeak()
  }, [q.id, q.prompt])

  function choose(value: string) {
    if (solved) return
    if (wrong.includes(value)) return // すでに ちがった ボタンは 無視

    if (value === q.answer) {
      if (attempts === 0) setCorrectCount((c) => c + 1) // 1回めの せいかいだけ 数える
      setSolved(true)
      playCorrect()
    } else {
      setWrong((w) => [...w, value])
      setAttempts((a) => a + 1)
      playWrong()
    }
  }

  function next() {
    playTap()
    if (isLast) {
      if (finished) return
      setFinished(true)
      onFinish(correctCount)
      return
    }
    setIndex((i) => i + 1)
    setAttempts(0)
    setWrong([])
    setSolved(false)
  }

  // 段階ヒント：まちがえた かいすうに あわせて だんだん くわしく
  const showHint = attempts > 0 && !solved
  const currentHint = showHint ? q.hints[Math.min(attempts - 1, q.hints.length - 1)] : ''
  // 2かい まちがえたら、せいかいの ボタンを やさしく ひからせて つまり防止
  const reveal = !solved && attempts >= 2

  return (
    <div className="game" style={{ ['--accent' as string]: stage.color }}>
      <div className="game-top">
        <button className="btn btn-round" onClick={onQuit} aria-label="ホームへ もどる">
          🏠
        </button>
        <div className="game-title">
          {stage.emoji} {stage.title}
        </div>
        <button
          className="btn btn-round"
          onClick={onToggleSound}
          aria-label={soundOn ? 'おとを けす' : 'おとを つける'}
          title={soundOn ? 'おとを けす' : 'おとを つける'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        <div className="game-count">
          {index + 1}/{questions.length}
        </div>
      </div>

      {level > 1 && <div className="level-chip">レベル {level}</div>}

      <div className="dots">
        {questions.map((_, i) => (
          <span key={i} className={`dot ${i < index ? 'done' : ''} ${i === index ? 'now' : ''}`} />
        ))}
      </div>

      <div className="card question-card">
        <div className="prompt-row">
          <p className="prompt">{q.prompt}</p>
          {soundOn && (
            <button
              className="speak-btn"
              onClick={() => speak(q.prompt)}
              aria-label="もんだいを よみあげる"
              title="もんだいを よみあげる"
            >
              🔊
            </button>
          )}
        </div>

        <div className="visual-area">
          {/* 問題ごとに key を かえて、とうじょうアニメを まいかい さいせい */}
          <VisualView key={q.id} visual={q.visual} revealed={solved} />
        </div>

        {solved && (
          <div className="feedback ok" role="status">
            🎉 よくできたね！
          </div>
        )}
        {showHint && (
          <div className="feedback hint" role="status">
            <span className="hint-badge">💡 ヒント {q.hints.length > 1 ? `(${Math.min(attempts, q.hints.length)})` : ''}</span>
            <span>だいじょうぶ！ もういちど やってみよう。{currentHint}</span>
          </div>
        )}

        <div className={`choices ${q.choiceLayout === 'row' ? 'choices-row' : ''}`}>
          {q.choices.map((c) => {
            const isWrong = wrong.includes(c.value)
            const isAnswer = solved && c.value === q.answer
            // 2かい まちがえた あと、せいかいの ボタンだけ ひかって みちびく
            const isRevealed = reveal && !isWrong && c.value === q.answer
            return (
              <button
                key={c.value}
                className={`choice ${isWrong ? 'choice-wrong' : ''} ${isAnswer ? 'choice-right' : ''} ${
                  isRevealed ? 'choice-reveal' : ''
                }`}
                onClick={() => choose(c.value)}
                disabled={solved || isWrong}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {solved && (
          <button className="btn btn-big btn-next" onClick={next}>
            {isLast ? 'けっかを みる 🏁' : 'つぎへ ▶'}
          </button>
        )}
      </div>
    </div>
  )
}
