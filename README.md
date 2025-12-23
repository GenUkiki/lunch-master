- 実行手順（要点）
  - data-layer/db.json を用意
  - json-server 起動: npm run start-json
  - API サーバ起動: npm install, npm run dev
  - seed の実行: npm run seed
- エンドポイントの一覧とサンプル
- セキュリティ・運用メモ
- 簡易な認証フローについての注意

実行手順まとめ

- 前提: data-layer のデータベース（db.json）を用意

1.  data-layer/db.json を用意
2.  json-server を起動
    - ディレクトリを api とは別にして実行
    - 例: cd data-layer; npx json-server --watch db.json --port 3000
3.  API サーバを起動
    - cd api
    - npm install
    - npm run dev
4.  初期データ投入（任意）
    - seed.js を利用して seed を実行
    - npm run seed
5.  動作確認
    - POST /auth/login でトークン取得
    - GET /api/orders?date=YYYY-MM-DD で注文取得
    - POST /api/orders で新規注文を作成（08:30-08:50 内に実行して下さい）
    - 09:30 のロックは schedulingService（cron）により自動実行想定

補足と今後の改善案

- 現状のコードは「実装の正味の出発点」です。実プロダクション向けには以下を追加検討してください。
  - JWT などの標準的なトークン認証へ移行
  - データ検証・バリデーションライブラリの導入
  - 詳細な API ドキュメント (OpenAPI 形式) の作成
  - テスト（ユニット/結合）の整備
  - エラーハンドリングとリトライ戦略の整備
  - セキュリティ強化（CSRF 対策、適切なヘッダ管理、TLS 運用）
