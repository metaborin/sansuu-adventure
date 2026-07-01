import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 本番ビルド（GitHub Pages）では /sansuu-adventure/ 以下に配信されるため base を設定。
// ローカル開発（npm run dev）ではルート / のままにする。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sansuu-adventure/' : '/',
  plugins: [react()],
}))
