import { useMemo, useState } from 'react'
import type { StageMeta } from '../types'
import { generateQuestions } from '../questions'
import { VisualView } from './Visual'

// ==========================================================================
// 問題画面（1ステージ ＝ 5問）
// ・えらぶ → せいかい なら「つぎへ」/ まちがい なら やさしく ヒント（何回でも やりなおせる）
// ・スコアは「1回めで せいかい できた 数」で つける（成功体験を おおく）
// ==========================================================================

const QUESTIONS_PER_STAGE = 5

type Props = {
  stage: StageMeta
  onFinish: (correct: number) => void
  onQuit: () => void
}

export function Game({ stage, onFinish, onQuit }: Props) {
  // 5問を さいしょに 作って おく（このコンポーネントが 生きている あいだは 変わらない）
  const questions = useMemo(() => generateQuestions(stage.id, QUESTIONS_PER_STAGE), [stage.id])

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false) // 連打ぼうし

  const q = questions[index]
  const isLast = index === questions.length - 1

  function choose(value: string) {
    if (solved) return
    if (wrong.includes(value)) return // すでに ちがった ボタンは 無視

    if (value === q.answer) {
      if (attempts === 0) setCorrectCount((c) => c + 1) // 1回めの せいかいだけ 数える
      setSolved(true)
    } else {
      setWrong((w) => [...w, value])
      setAttempts((a) => a + 1)
    }
  }

  function next() {
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

  const showHint = attempts > 0 && !solved

  return (
    <div className="game" style={{ ['--accent' as string]: stage.color }}>
      <div className="game-top">
        <button className="btn btn-round" onClick={onQuit} aria-label="ホームへ もどる">
          🏠
        </button>
        <div className="game-title">
          {stage.emoji} {stage.title}
        </div>
        <div className="game-count">
          {index + 1}/{questions.length}
        </div>
      </div>

      <div className="dots">
        {questions.map((_, i) => (
          <span key={i} className={`dot ${i < index ? 'done' : ''} ${i === index ? 'now' : ''}`} />
        ))}
      </div>

      <div className="card question-card">
        <p className="prompt">{q.prompt}</p>

        <div className="visual-area">
          <VisualView visual={q.visual} revealed={solved} />
        </div>

        {solved && (
          <div className="feedback ok" role="status">
            🎉 よくできたね！
          </div>
        )}
        {showHint && (
          <div className="feedback hint" role="status">
            <span className="hint-badge">💡 ヒント</span>
            <span>もういちど かぞえてみよう。{q.hint}</span>
          </div>
        )}

        <div className="choices">
          {q.choices.map((c) => {
            const isWrong = wrong.includes(c.value)
            const isAnswer = solved && c.value === q.answer
            return (
              <button
                key={c.value}
                className={`choice ${isWrong ? 'choice-wrong' : ''} ${isAnswer ? 'choice-right' : ''}`}
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
