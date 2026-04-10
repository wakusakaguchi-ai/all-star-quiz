# 🎉 オールスター感謝祭 集計アプリ

QRコードをスキャンして参加できる、リアルタイム4択クイズ集計アプリ。

## セットアップ手順

### 1. Vercel にデプロイ

1. GitHubにリポジトリを作成してプッシュ
2. [vercel.com](https://vercel.com) でリポジトリをインポート → Deploy

### 2. Vercel KV を作成・リンク

1. Vercel ダッシュボード → **Storage** タブ → **Create Database** → **KV**
2. データベース名を入力（例: `all-star-quiz`）→ 作成
3. **Connect to Project** でデプロイしたプロジェクトにリンク
4. 自動的に環境変数（`KV_REST_API_URL` / `KV_REST_API_TOKEN`）が設定される
5. Vercel 側で **Redeploy** を実行

### 3. ローカル開発する場合

```bash
npm i -g vercel
vercel link        # プロジェクトとリンク
vercel env pull    # .env.local に KV の認証情報を取得
npm run dev
```

## 使い方

1. **ホスト（PC）**: トップページで「新しいゲームを作成」
2. **大画面表示**: ホスト画面の「大画面表示」ボタンでプロジェクター用画面を開く
3. **参加者（スマホ）**: 表示されたQRコードをスキャン → 名前入力 → 参加
4. **投票開始**: ホスト画面で「投票開始」→ 参加者のスマホに A/B/C/D ボタンが表示
5. **正解発表**: ホストが正解を選択 → バーグラフとランキングが表示
