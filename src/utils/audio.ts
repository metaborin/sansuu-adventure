// ==========================================================================
// おと（音声）まわり
// ・こうかおん … Web Audio API で その場で 合成（音声ファイル不要・オフライン可）
// ・よみあげ   … Web Speech API（ブラウザ内蔵・外部通信なし）で 日本語 読み上げ
// ・オン/オフは localStorage に 保存
//
// 将来 音声ファイルや べつの エンジンに 差し替えたく なったら、
// このファイルの 関数の 中身だけ 変えれば OK（よび出し側は そのまま）。
// ==========================================================================

const STORAGE_KEY = 'sansuu-adventure-1nensei:sound'

let enabled = true
let ctx: AudioContext | null = null

/** 保存された オン/オフを よみこむ（さいしょに 1かい よぶ） */
export function loadSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    enabled = raw === null ? true : raw === 'on'
  } catch {
    enabled = true
  }
  return enabled
}

export function isSoundEnabled(): boolean {
  return enabled
}

export function setSoundEnabled(value: boolean): void {
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch {
    // 保存できなくても うごく
  }
  if (!value) stopSpeak()
}

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

/** たんおん（1つの おと）を ならす */
function tone(
  freq: number,
  startOffset: number,
  duration: number,
  gain = 0.14,
  type: OscillatorType = 'sine'
): void {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = c.currentTime + startOffset
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.03)
}

/** ボタンを おした ときの かるい おと */
export function playTap(): void {
  if (!enabled) return
  tone(600, 0, 0.08, 0.07, 'triangle')
}

/** せいかいの おと（あかるい 2おん） */
export function playCorrect(): void {
  if (!enabled) return
  tone(660, 0, 0.14, 0.13, 'sine')
  tone(990, 0.12, 0.2, 0.13, 'sine')
}

/** まちがいの おと（やさしく・否定的にならない） */
export function playWrong(): void {
  if (!enabled) return
  tone(440, 0, 0.12, 0.08, 'sine')
  tone(370, 0.1, 0.18, 0.08, 'sine')
}

/** クリアの おと（ミニ ファンファーレ） */
export function playClear(): void {
  if (!enabled) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // ド ミ ソ ド
  notes.forEach((f, i) => tone(f, i * 0.13, 0.28, 0.13, 'triangle'))
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

let voicesReady = false
function jaVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  return synth.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('ja'))
}

/** テキストを 読み上げる（日本語）。おとが オフ／未対応なら なにもしない */
export function speak(text: string): void {
  if (!enabled) return
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

    // 音声リストが あとから 読み込まれる ブラウザ用（1回だけ 監視）
    if (!voicesReady && !voice) {
      voicesReady = true
      synth.onvoiceschanged = () => {
        /* つぎの よみあげから 日本語音声が 使われる */
      }
    }
  } catch {
    // 未対応でも うごく
  }
}

/** 読み上げを とめる */
export function stopSpeak(): void {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    // なにもしない
  }
}
