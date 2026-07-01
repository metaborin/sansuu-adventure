// ==========================================================================
// おと（音声）まわり
// ・こうかおん & BGM … Web Audio API で その場で 合成（音声ファイル不要・オフライン可）
// ・よみあげ         … Web Speech API（ブラウザ内蔵・外部通信なし）で 日本語 読み上げ
//
// せってい は 2しゅるい（それぞれ localStorage に 保存）：
//   ・sfx    … BGM ＋ こうかおん（デフォルト オン）
//   ・speech … 問題文の じどう 読み上げ（デフォルト オフ）
//              ※ オフでも「よみあげボタン」を おせば その場で 読み上げできる
//
// 将来 音声ファイルや べつの エンジンに 差し替えたく なったら、
// このファイルの 中身だけ 変えれば OK（よび出し側は そのまま）。
// ==========================================================================

const SFX_KEY = 'sansuu-adventure-1nensei:sound'
const SPEECH_KEY = 'sansuu-adventure-1nensei:speech'

let sfxEnabled = true // BGM ＋ こうかおん
let speechEnabled = false // じどう 読み上げ
let ctx: AudioContext | null = null

// --- せってい の よみこみ／ほぞん -----------------------------------------

/** BGM・こうかおん の オン/オフ を よみこむ（デフォルト オン） */
export function loadSfxEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SFX_KEY)
    sfxEnabled = raw === null ? true : raw === 'on'
  } catch {
    sfxEnabled = true
  }
  return sfxEnabled
}

/** じどう 読み上げ の オン/オフ を よみこむ（デフォルト オフ） */
export function loadSpeechEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SPEECH_KEY)
    speechEnabled = raw === 'on'
  } catch {
    speechEnabled = false
  }
  return speechEnabled
}

export function isSfxEnabled(): boolean {
  return sfxEnabled
}
export function isSpeechEnabled(): boolean {
  return speechEnabled
}

export function setSfxEnabled(value: boolean): void {
  sfxEnabled = value
  try {
    localStorage.setItem(SFX_KEY, value ? 'on' : 'off')
  } catch {
    // 保存できなくても うごく
  }
  if (value) startBgm()
  else stopBgm()
}

export function setSpeechEnabled(value: boolean): void {
  speechEnabled = value
  try {
    localStorage.setItem(SPEECH_KEY, value ? 'on' : 'off')
  } catch {
    // 保存できなくても うごく
  }
  if (!value) stopSpeak()
}

// --- AudioContext ---------------------------------------------------------

/** AudioContext を 用意（ユーザー操作の 中で よばれる まえは 音は 鳴らない） */
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** 1つの おと を、していした じかん・出力先 に ならす */
function playOsc(
  freq: number,
  whenAbs: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  dest: AudioNode
): void {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, whenAbs)
  g.gain.linearRampToValueAtTime(peak, whenAbs + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, whenAbs + duration)
  osc.connect(g)
  g.connect(dest)
  osc.start(whenAbs)
  osc.stop(whenAbs + duration + 0.03)
}

/** こうかおん の たんおん（いま から startOffset びょう ご に ならす） */
function sfxTone(
  freq: number,
  startOffset: number,
  duration: number,
  peak = 0.14,
  type: OscillatorType = 'sine'
): void {
  const c = getCtx()
  if (!c) return
  playOsc(freq, c.currentTime + startOffset, duration, peak, type, c.destination)
}

// --- こうかおん -----------------------------------------------------------

/** ボタンを おした ときの かるい おと */
export function playTap(): void {
  if (!sfxEnabled) return
  sfxTone(600, 0, 0.08, 0.07, 'triangle')
}

/** せいかいの おと（あかるい 2おん） */
export function playCorrect(): void {
  if (!sfxEnabled) return
  sfxTone(660, 0, 0.14, 0.13, 'sine')
  sfxTone(990, 0.12, 0.2, 0.13, 'sine')
}

/** まちがいの おと（やさしく・否定的にならない） */
export function playWrong(): void {
  if (!sfxEnabled) return
  sfxTone(440, 0, 0.12, 0.08, 'sine')
  sfxTone(370, 0.1, 0.18, 0.08, 'sine')
}

/** クリアの おと（ミニ ファンファーレ） */
export function playClear(): void {
  if (!sfxEnabled) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // ド ミ ソ ド
  notes.forEach((f, i) => sfxTone(f, i * 0.13, 0.28, 0.13, 'triangle'))
}

// --- BGM（やさしい ループ）------------------------------------------------

const BGM_GAIN = 0.045
const BGM_STEP = 0.28 // 1ステップの びょうすう
// C major の やさしい アルペジオ（16ステップで ループ）
const BGM_MELODY: (number | null)[] = [
  523.25, 659.25, 783.99, 659.25, // ド ミ ソ ミ
  587.33, 698.46, 880.0, 698.46, // レ ファ ラ ファ
  523.25, 659.25, 783.99, 1046.5, // ド ミ ソ ド↑
  493.88, 587.33, 698.46, 587.33, // シ レ ファ レ
]
const BGM_BASS: (number | null)[] = [
  130.81, null, null, null, // ド
  146.83, null, null, null, // レ
  130.81, null, null, null, // ド
  98.0, null, null, null, // ソ（ひくめ）
]

let bgmGain: GainNode | null = null
let bgmTimer: number | null = null
let bgmStep = 0
let bgmNextTime = 0
let bgmPlaying = false

function scheduleBgm(): void {
  const c = getCtx()
  if (!c || !bgmGain) return
  // すこし さきまで 予約して おく（とぎれ防止）
  while (bgmNextTime < c.currentTime + 0.35) {
    const mel = BGM_MELODY[bgmStep]
    if (mel) playOsc(mel, bgmNextTime, 0.26, 0.5, 'triangle', bgmGain)
    const bass = BGM_BASS[bgmStep]
    if (bass) playOsc(bass, bgmNextTime, 0.5, 0.45, 'sine', bgmGain)
    bgmNextTime += BGM_STEP
    bgmStep = (bgmStep + 1) % BGM_MELODY.length
  }
}

/** BGM を はじめる（おとが オフ／未対応／ユーザー操作前は なにもしない） */
export function startBgm(): void {
  if (!sfxEnabled || bgmPlaying) return
  const c = getCtx()
  if (!c) return
  if (!bgmGain) {
    bgmGain = c.createGain()
    bgmGain.gain.value = BGM_GAIN
    bgmGain.connect(c.destination)
  }
  bgmPlaying = true
  bgmStep = 0
  bgmNextTime = c.currentTime + 0.1
  scheduleBgm()
  bgmTimer = window.setInterval(scheduleBgm, 60)
}

/** BGM を とめる */
export function stopBgm(): void {
  bgmPlaying = false
  if (bgmTimer !== null) {
    clearInterval(bgmTimer)
    bgmTimer = null
  }
}

// --- よみあげ（音声合成）--------------------------------------------------

/** 記号を 日本語で 読みやすい ことばに 変える（3 + 4 = ? → 3 たす 4 は） */
function normalizeForSpeech(text: string): string {
  return text
    .replace(/\+/g, ' たす ')
    .replace(/[-−]/g, ' ひく ')
    .replace(/=/g, ' は ')
    .replace(/□/g, ' なに ')
    .replace(/[?？]/g, '')
    .trim()
}

function jaVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  return synth.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('ja'))
}

/**
 * テキストを 読み上げる（日本語）。ボタンなど「いま よみたい」ときに よぶ。
 * ※ これは speech せってい に かかわらず 鳴る（必要なときに 再生できる）。
 */
export function speak(text: string): void {
  try {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel() // まえの 読み上げを とめてから
    const u = new SpeechSynthesisUtterance(normalizeForSpeech(text))
    u.lang = 'ja-JP'
    u.rate = 0.95
    u.pitch = 1.1
    const voice = jaVoice(synth)
    if (voice) u.voice = voice
    synth.speak(u)
  } catch {
    // 未対応でも うごく
  }
}

/** じどう 読み上げ。せっていが オンのときだけ 鳴る（問題が でたとき など） */
export function speakAuto(text: string): void {
  if (!speechEnabled) return
  speak(text)
}

/** 読み上げを とめる */
export function stopSpeak(): void {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    // なにもしない
  }
}
