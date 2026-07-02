import { useEffect, useMemo, useState } from 'react'
import type { Question, StageMeta } from '../types'
import { generateQuestions } from '../questions'
import { VisualView } from './Visual'
import { playCorrect, playTap, playWrong, speak, speakAuto, stopSpeak } from '../utils/audio'

// ==========================================================================
// 問題画面（1ステージ ＝ 5問）
// ・えらぶ → せいかい なら「つぎへ」/ まちがい なら やさしく ヒント（何回でも やりなおせる）
// ・スコアは「1回めで せいかい できた 数」で つける（成功体験を おおく）
// ・5問のあと、1回めで まちがえた 問題が あれば「ふくしゅうタイム」で
//   もういちど チャレンジしてから けっかへ（まちがいっぱなしで 終わらせない）
// ==========================================================================

type Phase = 'main' | 'retry'

type Props = {
  stage: StageMeta
  /** 難易度レベル（1〜3）。出題の むずかしさが 変わる */
  level: number
  soundOn: boolean
  /** 1回の 問題数（せんせいの せっていで 5 or 10。デフォルト 5） */
  questionCount?: number
  /** ホームの「ふくしゅう」用に、問題を 外から わたす（わたすと 自動生成しない） */
  customQuestions?: Question[]
  /** ホームからの ふくしゅうセッションか（このときは ふくしゅうタイムを 重ねない） */
  isReviewSession?: boolean
  onToggleSound: () => void
  onFinish: (correct: number) => void
  onQuit: () => void
}

export function Game({
  stage,
  level,
  soundOn,
  questionCount = 5,
  customQuestions,
  isReviewSession = false,
  onToggleSound,
  onFinish,
  onQuit,
}: Props) {
  // 問題を さいしょに 作って おく（このコンポーネントが 生きている あいだは 変わらない）
  const mainQuestions = useMemo(
    () => customQuestions ?? generateQuestions(stage.id, questionCount, level),
    [stage.id, level, customQuestions, questionCount]
  )

  // フェーズ： main = ほんばん ／ retry = ふくしゅうタイム（まちがえた 問題に もういちど）
  const [phase, setPhase] = useState<Phase>('main')
  const [retryQueue, setRetryQueue] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [finished, setFinished] = useState(false) // 連打ぼうし

  const questions = phase === 'main' ? mainQuestions : retryQueue
  const q = questions[index]
  const isLast = index === questions.length - 1
  const hasRetry = retryQueue.length > 0 && !isReviewSession

  // あたらしい 問題に なったら、じどう 読み上げ（せっていが オンのときだけ・ベストエフォート）
  useEffect(() => {
    speakAuto(q.prompt)
    return () => stopSpeak()
  }, [q.id, q.prompt])

  function choose(value: string) {
    if (solved) return
    if (wrong.includes(value)) return // すでに ちがった ボタンは 無視

    if (value === q.answer) {
      // スコアは「ほんばんで 1回めに せいかい」だけ 数える（ふくしゅうタイムは 数えない）
      if (phase === 'main' && attempts === 0) setCorrectCount((c) => c + 1)
      setSolved(true)
      playCorrect()
    } else {
      // ほんばんで 1回めに まちがえた 問題は、ふくしゅうタイム用に とっておく
      if (phase === 'main' && attempts === 0 && !isReviewSession) {
        setRetryQueue((rq) => [...rq, q])
      }
      setWrong((w) => [...w, value])
      setAttempts((a) => a + 1)
      playWrong()
    }
  }

  function resetPerQuestion() {
    setAttempts(0)
    setWrong([])
    setSolved(false)
  }

  function next() {
    playTap()
    if (!isLast) {
      setIndex((i) => i + 1)
      resetPerQuestion()
      return
    }
    // さいごの 問題の あと：ふくしゅうタイムが あれば そちらへ
    if (phase === 'main' && hasRetry) {
      setPhase('retry')
      setIndex(0)
      resetPerQuestion()
      return
    }
    if (finished) return
    setFinished(true)
    onFinish(correctCount)
  }

  // 段階ヒント：まちがえた かいすうに あわせて だんだん くわしく
  const showHint = attempts > 0 && !solved
  const currentHint = showHint ? q.hints[Math.min(attempts - 1, q.hints.length - 1)] : ''
  // 2かい まちがえたら、せいかいの ボタンを やさしく ひからせて つまり防止
  const reveal = !solved && attempts >= 2

  // 「つぎへ」ボタンの ことば
  const nextLabel = !isLast
    ? 'つぎへ ▶'
    : phase === 'main' && hasRetry
      ? 'ふくしゅうタイムへ 💪'
      : 'けっかを みる 🏁'

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
          {phase === 'retry' ? 'ふくしゅう ' : ''}
          {index + 1}/{questions.length}
        </div>
      </div>

      {phase === 'retry' && (
        <div className="review-banner" role="status">
          💪 ふくしゅうタイム！ まちがえた もんだいに もういちど チャレンジ！
        </div>
      )}

      {level > 1 && !isReviewSession && phase === 'main' && <div className="level-chip">レベル {level}</div>}

      <div className="dots">
        {questions.map((_, i) => (
          <span
            key={i}
            className={`dot ${phase === 'retry' ? 'review' : ''} ${i < index ? 'done' : ''} ${i === index ? 'now' : ''}`}
          />
        ))}
      </div>

      <div className="card question-card">
        <div className="prompt-row">
          <p className="prompt">{q.prompt}</p>
          {/* いつでも 読み上げできる ボタン（よみあげ設定が オフでも 鳴る） */}
          <button
            className="speak-btn"
            onClick={() => speak(q.prompt)}
            aria-label="もんだいを よみあげる"
            title="もんだいを よみあげる"
          >
            🔊
          </button>
        </div>

        <div className="visual-area">
          {/* 問題ごとに key を かえて、とうじょうアニメを まいかい さいせい */}
          <VisualView key={`${phase}-${q.id}`} visual={q.visual} revealed={solved} />
        </div>

        {solved && (
          <div className="feedback ok" role="status">
            {phase === 'retry' ? '🎉 できたね！ すごい！' : '🎉 よくできたね！'}
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
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
