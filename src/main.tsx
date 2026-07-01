import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// PWA：本番ビルドのときだけ Service Worker を登録（オフラインでも あそべる）
// 開発中（npm run dev）は キャッシュが じゃまに なるので 登録しない。
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        // 登録に しっぱいしても ゲームは ふつうに あそべる
      })
  })
}
