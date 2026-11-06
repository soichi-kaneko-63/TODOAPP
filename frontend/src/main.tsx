// ●●React: StrictMode は開発時に問題を見つけやすくするためのReactの検査機能。
import { StrictMode } from 'react'
// ●●React: createRoot はHTML内の表示場所にReactアプリを接続するAPI。
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ●●React: id="root" の要素をReactの表示先にし、Appコンポーネントを描画する。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ●●React: AppコンポーネントをStrictModeの中で起動する。 */}
    <App />
  </StrictMode>,
)
