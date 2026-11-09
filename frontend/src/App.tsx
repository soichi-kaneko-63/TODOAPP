////////
// ●●React: useState は画面の状態を保持し、useEffect は画面表示後の処理を実行するReactの機能。
import { useEffect, useState } from 'react'
import './App.css'

// TypeScript: 接続状態として使える文字列を限定する型。React専用の構文ではない。
type ConnectionStatus = 'checking' | 'connected' | 'error'

// TypeScript: APIから受け取るデータの形を表す型。
interface HealthResponse {
  status: 'ok'
}

function isHealthResponse(value: unknown): value is HealthResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    value.status === 'ok'
  )
}

// ●●React: App は関数コンポーネント。画面を表す関数で、下の JSX を返す。
function App() {
  // ●●React: useState で状態と更新関数を作る。更新するとReactが画面を再描画する。
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('checking')
  const [checkNumber, setCheckNumber] = useState(0)

  // ●●React: useEffect は初回表示後と checkNumber の変更後にAPI確認を実行する。
  useEffect(() => {
    const controller = new AbortController()

    async function checkConnection() {
      setConnectionStatus('checking')

      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Health check failed: HTTP ${response.status}`)
        }

        const body: unknown = await response.json()
        if (!isHealthResponse(body)) {
          throw new Error('Health check returned an unexpected response')
        }

        setConnectionStatus('connected')
      } catch {
        if (!controller.signal.aborted) {
          setConnectionStatus('error')
        }
      }
    }

    void checkConnection()
    return () => controller.abort()
  }, [checkNumber])

  // TypeScript/JavaScript: 状態に対応する表示文を選ぶ処理。React専用構文ではない。
  const statusMessage = {
    checking: '接続を確認しています…',
    connected: 'API・PostgreSQLに接続できました',
    error: 'APIに接続できません。backendで npm run dev を起動してください。',
  }[connectionStatus]

  // ●●React: JSX。HTMLに似た書き方で画面の構造を記述する。
  return (
    <main className="page">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">TODO APP · DAY 1</p>
        <h1 id="welcome-title">Hello, React!</h1>
        <p className="intro">
          ReactとTypeScriptで作った、TODOアプリのフロントエンドです。
        </p>

        <div
          className={`connection connection--${connectionStatus}`}
          role="status"
          aria-live="polite"
        >
          <span className="connection__dot" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>

        <div className="actions">
          <button
            className="button button--primary"
            // ●●React: イベントハンドラー。クリックで状態を更新し、useEffectのAPI確認を再実行する。
            onClick={() => setCheckNumber((number) => number + 1)}
            type="button"
          >
            接続を再確認
          </button>
          {/* ●●React: {} の中でJavaScriptの値を埋め込み、状態に応じた表示にする。 */}
          <a className="button button--secondary" href="/api-docs" target="_blank" rel="noreferrer">
            Swagger UIを開く
          </a>
        </div>
        <p className="check-count">再確認回数: {checkNumber}</p>
      </section>
      <footer>Frontend: React + TypeScript + Vite</footer>
    </main>
  )
}

export default App
