import { useEffect, useState } from 'react'
import type { Progress, Question, StageMeta } from './types'
import { getStage, STAGES } from './data/stages'
import { Home } from './components/Home'
import { Game } from './components/Game'
import { Result } from './components/Result'
import { BadgeBook } from './components/Badges'
import { evaluateBadges, getBadge, type BadgeMeta } from './data/badges'
import { generateDailyQuestions, generateReviewQuestions } from './questions'
import {
  createEmptyProgress,
  isStageUnlocked,
  loadProgress,
  nextLevel,
  recordDailyClear,
  saveProgress,
  starsForCorrect,
} from './utils/storage'
import {
  loadSfxEnabled,
  loadSpeechEnabled,
  setSfxEnabled,
  setSpeechEnabled,
  startBgm,
} from './utils/audio'

// ==========================================================================
// アプリ本体：がめんの きりかえ（ホーム / もんだい / けっか / ふくしゅう）と 進捗の 管理
// ==========================================================================

// ホームの「ふくしゅう」用の 仮想ステージ（一覧には 出ない）
const REVIEW_STAGE: StageMeta = {
  id: 0,
  title: 'ふくしゅう',
  emoji: '💪',
  color: '#7048e8',
  goal: 'まちがえた もんだいに もういちど チャレンジ',
  featured: true,
}

// 「きょうのチャレンジ」用の 仮想ステージ（一覧には 出ない）
const DAILY_STAGE: StageMeta = {
  id: -1,
  title: 'きょうの チャレンジ',
  emoji: '🌞',
  color: '#f59f00',
  goal: 'まいにち 1かい、ミックス 5もん',
  featured: true,
}

type Screen =
  | { name: 'home' }
  | { name: 'game'; stageId: number }
  | { name: 'result'; stageId: number; correct: number; leveledUp: boolean; newBadges: string[] }
  | { name: 'review'; questions: Question[]; stageIds: number[] }
  | { name: 'review-result'; correct: number; newBadges: string[] }
  | { name: 'daily'; questions: Question[] }
  | { name: 'daily-result'; correct: number; newBadges: string[]; streak: number }
  | { name: 'badges' }

/** バッジIDの ならびを 表示用の 情報に かえる */
function badgeMetas(ids: string[]): BadgeMeta[] {
  return ids.map((id) => getBadge(id)).filter((b): b is BadgeMeta => Boolean(b))
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  // 「もういちど」で問題を作りなおすため、Game を つくりなおす ための カギ
  const [playKey, setPlayKey] = useState(0)
  // おと（BGM＋こうかおん：デフォルトオン）／ よみあげ（デフォルトオフ）
  const [soundOn, setSoundOn] = useState<boolean>(() => loadSfxEnabled())
  const [speechOn, setSpeechOn] = useState<boolean>(() => loadSpeechEnabled())

  function toggleSound() {
    const next = !soundOn
    setSfxEnabled(next) // BGM の 開始/停止も この中で
    setSoundOn(next)
  }

  function toggleSpeech() {
    const next = !speechOn
    setSpeechEnabled(next)
    setSpeechOn(next)
  }

  // さいしょの タップ（ユーザー操作）で BGM を 開始（ブラウザの じどう再生 制限のため）
  useEffect(() => {
    const start = () => startBgm()
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [])

  // 進捗を こうしんして 保存する
  function updateProgress(next: Progress) {
    setProgress(next)
    saveProgress(next)
  }

  function startStage(stageId: number) {
    setPlayKey((k) => k + 1)
    setScreen({ name: 'game', stageId })
  }

  function finishStage(stageId: number, correct: number) {
    const prev = progress.stages[stageId] ?? {
      cleared: false,
      bestCorrect: 0,
      stars: 0,
      level: 1,
      misses: 0,
    }
    const gainedStars = starsForCorrect(correct)
    const nowCleared = correct >= 4
    const newLevel = nextLevel(prev.level, correct) // 直近の成績で難易度を自動調整
    const nextProgress: Progress = {
      ...progress,
      stages: {
        ...progress.stages,
        [stageId]: {
          cleared: prev.cleared || nowCleared,
          bestCorrect: Math.max(prev.bestCorrect, correct),
          stars: Math.max(prev.stars, gainedStars),
          level: newLevel,
          // 1回めで まちがえた数を きろく → ホームの「ふくしゅう」の 出題もとに
          misses: 5 - correct,
        },
      },
    }
    // あたらしい バッジが とれたか しらべて 保存
    const { progress: withBadges, newBadges } = evaluateBadges(nextProgress)
    updateProgress(withBadges)
    setScreen({
      name: 'result',
      stageId,
      correct,
      leveledUp: newLevel > prev.level,
      newBadges: newBadges.map((b) => b.id),
    })
  }

  // --- ふくしゅう（ホームから）--------------------------------------------
  function startReview() {
    const weak = STAGES.filter((s) => (progress.stages[s.id]?.misses ?? 0) > 0)
    if (weak.length === 0) {
      setScreen({ name: 'home' })
      return
    }
    const entries = weak.map((s) => ({
      stageId: s.id,
      level: progress.stages[s.id]?.level ?? 1,
      weight: progress.stages[s.id]?.misses ?? 1,
    }))
    const { questions, stageIds } = generateReviewQuestions(entries, 5)
    setPlayKey((k) => k + 1)
    setScreen({ name: 'review', questions, stageIds })
  }

  function finishReview(correct: number, stageIds: number[]) {
    // 4問以上 できたら、出題した ステージの「にがて」を 消して、クリア回数を きろく
    let next: Progress = progress
    if (correct >= 4) {
      const stages = { ...progress.stages }
      for (const id of stageIds) {
        const sp = stages[id]
        if (sp) stages[id] = { ...sp, misses: 0 }
      }
      next = { ...progress, stages, reviewClears: progress.reviewClears + 1 }
    }
    const { progress: withBadges, newBadges } = evaluateBadges(next)
    updateProgress(withBadges)
    setScreen({ name: 'review-result', correct, newBadges: newBadges.map((b) => b.id) })
  }

  // --- きょうのチャレンジ ----------------------------------------------------
  function startDaily() {
    // あそべる（解放ずみ）ステージから、いまの レベルで ミックス出題
    const entries = STAGES.filter((s) => isStageUnlocked(progress, s.id)).map((s) => ({
      stageId: s.id,
      level: progress.stages[s.id]?.level ?? 1,
    }))
    setPlayKey((k) => k + 1)
    setScreen({ name: 'daily', questions: generateDailyQuestions(entries, 5) })
  }

  function finishDaily(correct: number) {
    // クリア（4問以上）なら きろく更新（1日1回だけ 数える）
    let next: Progress = progress
    if (correct >= 4) {
      next = { ...progress, daily: recordDailyClear(progress.daily) }
    }
    const { progress: withBadges, newBadges } = evaluateBadges(next)
    updateProgress(withBadges)
    setScreen({
      name: 'daily-result',
      correct,
      newBadges: newBadges.map((b) => b.id),
      streak: withBadges.daily.streak,
    })
  }

  function unlockAll() {
    const ok = window.confirm('すべての ステージを 解放しますか？（せんせい・ほごしゃ用）')
    if (!ok) return
    updateProgress({ ...progress, unlockedAll: true })
  }

  function resetProgress() {
    const ok = window.confirm('しんちょくを ぜんぶ リセットしますか？ もとには もどせません。')
    if (!ok) return
    updateProgress(createEmptyProgress())
    setScreen({ name: 'home' })
  }

  // --- 画面の きりかえ ------------------------------------------------------
  if (screen.name === 'game') {
    const stage = getStage(screen.stageId)
    if (!stage) return <FallbackHome />
    return (
      <Game
        key={`${screen.stageId}-${playKey}`}
        stage={stage}
        level={progress.stages[screen.stageId]?.level ?? 1}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onFinish={(correct) => finishStage(screen.stageId, correct)}
        onQuit={() => setScreen({ name: 'home' })}
      />
    )
  }

  if (screen.name === 'review') {
    return (
      <Game
        key={`review-${playKey}`}
        stage={REVIEW_STAGE}
        level={1}
        soundOn={soundOn}
        customQuestions={screen.questions}
        isReviewSession
        onToggleSound={toggleSound}
        onFinish={(correct) => finishReview(correct, screen.stageIds)}
        onQuit={() => setScreen({ name: 'home' })}
      />
    )
  }

  if (screen.name === 'badges') {
    return <BadgeBook progress={progress} onBack={() => setScreen({ name: 'home' })} />
  }

  if (screen.name === 'daily') {
    return (
      <Game
        key={`daily-${playKey}`}
        stage={DAILY_STAGE}
        level={1}
        soundOn={soundOn}
        customQuestions={screen.questions}
        onToggleSound={toggleSound}
        onFinish={finishDaily}
        onQuit={() => setScreen({ name: 'home' })}
      />
    )
  }

  if (screen.name === 'daily-result') {
    return (
      <Result
        stage={DAILY_STAGE}
        correct={screen.correct}
        total={5}
        stars={0}
        cleared={screen.correct >= 4}
        leveledUp={false}
        newLevel={1}
        hasNext={false}
        isDaily
        streak={screen.streak}
        newBadges={badgeMetas(screen.newBadges)}
        onNext={() => setScreen({ name: 'home' })}
        onReplay={startDaily}
        onHome={() => setScreen({ name: 'home' })}
      />
    )
  }

  if (screen.name === 'review-result') {
    const stillHasMisses = STAGES.some((s) => (progress.stages[s.id]?.misses ?? 0) > 0)
    return (
      <Result
        stage={REVIEW_STAGE}
        correct={screen.correct}
        total={5}
        stars={0}
        cleared={screen.correct >= 4}
        leveledUp={false}
        newLevel={1}
        hasNext={false}
        isReview
        newBadges={badgeMetas(screen.newBadges)}
        onNext={() => setScreen({ name: 'home' })}
        onReplay={() => {
          if (stillHasMisses) startReview()
          else setScreen({ name: 'home' })
        }}
        onHome={() => setScreen({ name: 'home' })}
      />
    )
  }

  if (screen.name === 'result') {
    const stage = getStage(screen.stageId)
    if (!stage) return <FallbackHome />
    const sp = progress.stages[screen.stageId]
    const cleared = screen.correct >= 4
    const nextExists = STAGES.some((s) => s.id === screen.stageId + 1)
    return (
      <Result
        stage={stage}
        correct={screen.correct}
        total={5}
        stars={sp?.stars ?? starsForCorrect(screen.correct)}
        cleared={cleared}
        leveledUp={screen.leveledUp}
        newLevel={sp?.level ?? 1}
        hasNext={cleared && nextExists}
        newBadges={badgeMetas(screen.newBadges)}
        onNext={() => {
          if (isStageUnlocked(progress, screen.stageId + 1)) startStage(screen.stageId + 1)
          else setScreen({ name: 'home' })
        }}
        onReplay={() => startStage(screen.stageId)}
        onHome={() => setScreen({ name: 'home' })}
      />
    )
  }

  return (
    <Home
      progress={progress}
      soundOn={soundOn}
      speechOn={speechOn}
      onToggleSound={toggleSound}
      onToggleSpeech={toggleSpeech}
      onStart={startStage}
      onStartReview={startReview}
      onStartDaily={startDaily}
      onOpenBadges={() => setScreen({ name: 'badges' })}
      onUnlockAll={unlockAll}
      onReset={resetProgress}
    />
  )

  function FallbackHome() {
    return (
      <Home
        progress={progress}
        soundOn={soundOn}
        speechOn={speechOn}
        onToggleSound={toggleSound}
        onToggleSpeech={toggleSpeech}
        onStart={startStage}
        onStartReview={startReview}
      onStartDaily={startDaily}
        onOpenBadges={() => setScreen({ name: 'badges' })}
        onUnlockAll={unlockAll}
        onReset={resetProgress}
      />
    )
  }
}
