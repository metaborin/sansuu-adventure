import { useEffect, useState } from 'react'
import type { Progress } from './types'
import { getStage, STAGES } from './data/stages'
import { Home } from './components/Home'
import { Game } from './components/Game'
import { Result } from './components/Result'
import {
  createEmptyProgress,
  isStageUnlocked,
  loadProgress,
  nextLevel,
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
// アプリ本体：がめんの きりかえ（ホーム / もんだい / けっか）と 進捗の 管理
// ==========================================================================

type Screen =
  | { name: 'home' }
  | { name: 'game'; stageId: number }
  | { name: 'result'; stageId: number; correct: number; leveledUp: boolean }

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
    const prev = progress.stages[stageId] ?? { cleared: false, bestCorrect: 0, stars: 0, level: 1 }
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
        },
      },
    }
    updateProgress(nextProgress)
    setScreen({ name: 'result', stageId, correct, leveledUp: newLevel > prev.level })
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
        onUnlockAll={unlockAll}
        onReset={resetProgress}
      />
    )
  }
}
