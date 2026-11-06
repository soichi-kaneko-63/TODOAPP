# TODO App frontend

React + TypeScript + Vite の学習用フロントエンドです。

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。APIとの接続状態を表示する
ため、別のターミナルで `backend` ディレクトリに移動して `npm run dev`
も起動してください。Viteは `/api` と `/api-docs` へのリクエストを
`http://127.0.0.1:3001` に転送します。

`npm run build` でTypeScriptのチェックと本番用ビルドを実行できます。
