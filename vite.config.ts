import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 本番ビルド（GitHub Pages）では /sansuu-adventure/ 以下に配信されるため base を設定。
// npm run preview（ビルド結果の確認）も同じ base で配信する必要がある。
// ローカル開発（npm run dev）だけルート / のままにする。
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/sansuu-adventure/' : '/',
  plugins: [react()],
}))
