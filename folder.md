1) 全体の設計方針
- データ層とビジネスロジック層を分離することで、日次の「確定ロック」などの運用ロジックを安定して実装できるようにする。
- json-server をデータ層として活用。Node.js アプリが認証・ワークフロー・通知・API統合などのビジネスロジックを担当。
- フロントエンドは任意だが、まずはブラウザから API を叩く前提で、バックエンドの API 側が叩きやすい設計を推奨。
- 将来の拡張性を見据え、モジュール化されたディレクトリ構成と共通ライブラリを用意。

2) 推奨フォルダ構成（テキストツリー形式）
- lunch-master/
  - data-layer/          # json-server を含むデータ層関連
    - db.json            # json-server のデータベースファイル
    - seeds/             # 初期データのシードファイル
      - users.seed.json
      - orders.seed.json
      - menu_items.seed.json
      - payments.seed.json
      - audit_logs.seed.json
    - routes.json          # json-server のルーティング補助（任意）
    - docker/              # json-server 用の最小構成があればここに配置
  - api/                   # Node.js アプリ（ビジネスロジック層／API層）
    - src/
      - index.js             # エントリポイント（Express などの設定）
      - app.js               # アプリ設定（ミドルウェア、ルーティングの初期化）
      - config/
        - index.js           # 環境設定を集約（dotenv 読込み、共通設定）
        - routes.js          # API バージョン・共通ルート設定
      - controllers/           # ルートごとのビジネスロジック
        - authController.js
        - orderController.js
        - menuController.js
        - paymentController.js
        - auditController.js
        - deliveryController.js
      - services/              # 外部 API 呼び出し/ビジネスロジックを組み立てる
        - jsonDbClient.js       # json-server への CRUD ラッパー
        - notificationService.js
        - billingService.js
        - schedulingService.js  # cron 等のスケジューリング関連
        - pdfOrLinkService.js    # 献立の PDF/URL 管理
      - models/                # ドメインモデル（軽量クラス/型定義）
        - user.js
        - order.js
        - menuItem.js
        - payment.js
        - auditLog.js
      - middleware/            # 認証・認可・バリデーション等
        - authMiddleware.js
        - validateMiddleware.js
        - rateLimitMiddleware.js
      - utils/                 # ログ、日付、共通処理
        - logger.js
        - dateUtil.js
        - httpClient.js
      - tests/                 # テストコード（unit/integration）
        - unit/
        - integration/
  - frontend/              # オプション：フロントエンド（UI）用
    - src/                 # UI アプリのコード（React 等を想定）
    - public/
  - scripts/               # 移行・初期データ投入・開発補助スクリプト
    - seed.js
    - importExcelToJson.js
    - startDevServer.sh
  - infra/                 # 実運用時のデプロイ構成情報（Docker/Compose など）
    - docker-compose.yml
    - k8s/                 # 必要時の Kubernetes マニフェスト
  - .env.example           # 環境変数雛形
  - .eslintignore
  - .eslintrc.json
  - .prettierignore
  - package.json
  - README.md

3) 各ディレクトリの役割と主なファイル
- data-layer/
  - db.json: json-server が扱うデータの原型。
  - seeds/*.seed.json: 初期データのサンプル（ユーザー、注文、献立、請求など）。
  - routes.json: json-server 用のカスタムルーティングが必要な場合の設定。
  - docker/: json-server を Docker で動かす場合の設定ファイル。

- api/src/
  - index.js: アプリの起動・ポート設定・サーバ全体の初期化。
  - app.js: ミドルウェア登録、ルーティングの初期化。
  - config/
    - index.js: 環境に依存する設定（データ層のエンドポイント、ロック時刻、通知設定など）。
  - controllers/
    - authController.js: ログイン/認証関連
    - orderController.js: 注文の CRUD、09:30 ロック処理のハンドリング
    - menuController.js: 献立の CRUD・参照
    - paymentController.js: 請求情報の表示・更新
    - auditController.js: 監査ログアクセス
    - deliveryController.js: 配送関連の補助情報
  - services/
    - jsonDbClient.js: json-server への REST API 呼び出しを集約
    - notificationService.js: 請求通知、未払い通知などの実装
    - billingService.js: 請求データの作成/確定・通知連携
    - schedulingService.js: 08:30-08:50 入力窓・09:30 ロック・11:30配送開始等のバッチ処理
    - pdfOrLinkService.js: 献立の PDF/URL の取得・表示ロジック
  - models/
    - user.js, order.js, menuItem.js, payment.js, auditLog.js: ドメインモデルの雛形
  - middleware/
    - authMiddleware.js: 認証・権限検査
    - validateMiddleware.js: 入力データの検証
    - rateLimitMiddleware.js: 簡易なリミット
  - utils/
    - logger.js: ログ出力
    - dateUtil.js: JST/タイムゾーン対応の日時ヘルパー
    - httpClient.js: HTTP 呼び出しの共通ラッパー
  - tests/
    - unit/, integration/: テストコード

- frontend/（任意）
  - ui/ React/Vue/その他のフレームワーク構成
  - コンポーネント、ビュー、サービス層を分離して実装
  - api/ フォームから api 呼び出しを行う層

- scripts/
  - seed.js: 初期データ投入用スクリプト
  - importExcelToJson.js: Excel から json 形式へ変換する補助ツール
  - startDevServer.sh: 開発環境起動スクリプト

- infra/
  - docker-compose.yml: json-server + Node.js API の同時起動構成
  - docker/
    - api.Dockerfile
    - db.Dockerfile

- .env.example
  - 開発用・運用用の環境変数の雛形。実運用時には .env に移行。

4) 実行・開発のための標準ワークフロー
- 開発環境の起動
  - json-server の起動:
    - cd data-layer
    - npx json-server --watch db.json --port 3000
  - Node.js アプリの起動:
    - cd api
    - npm install
    - npm run dev (または npm run start)
  - 両方を同時に起動する場合は Concurrently 等を利用
    - 例: "dev": "concurrently \"npm run start-json\" \"npm run start-api\""
- 初期データの投入
  - scripts/seed.js または seeds ディレクトリ内の JSON ファイルを利用
  - seed コマンドを追加して npm run seed で実行
- 移行戦略
  - 旧 Excel データを seeds/json へ変換、db.json へロード
  - 移行後、運用開始前にデータ整合性を検証

5) テストと品質管理
- テストフレームワーク: Jest または Vitest
- テストディレクトリ: api/src/tests/
- 主要テスト
  - orders の CRUD
  - 09:30 ロックの正確性
  - 請求通知トリガの発火条件
  - 献立参照の正確性
  - 監査ログの書き出し

6) デプロイ時の考慮点
- Docker Compose を使えばローカル開発と本番環境を共通構成で再現可能
- json-server は軽量データ層として運用する前提。本番運用でのデータ耐久性が重要な場合は、バックアップ/スナップショット戦略を用意
- 環境変数（JWT秘密鍵、API エンドポイント、通知設定）は .env で管理
- セキュリティ:內部ネットワーク限定、最小限の権限を設定。CSRF・XSS対策はフロントエンド側で適用

7) 追加の実装ガイドライン
- バッチ/ cron
  - 09:30 ロック処理は SchedulingService に実装
  - 日本時間（JST）を基準に Cron 表記を設定（例: 30 0? などは実プロダクションでの時刻設定に合わせて対応）
- 09:30 ロックの検証
  - orders テーブルの status を "pending" から "locked" に変更。locked_at をセット
  - ロック後は PUT/PATCH による更新を禁止する検証をミドルウェアで共通化
- 印刷データ生成
  - dailyPrint API を用意して、当日分の注文者一覧を CSV/PDF で出力
  - 紙運用と整合性を保つため、picked_up 状態の更新はデジタル側でも選択可能にしておくとよい
- 請求通知
  - payments.confirmed が true になった時点で通知をトリガー（メール／ダッシュボード通知）
  - 請求情報は一般ユーザのダッシュボードで参照可能

8) 導入時のリスクと対策
- データ整合性の崩れ
  - 監査ログを有効化、更新操作にはバリデーションと権限チェックを徹底
- Excel から json-server への移行時の欠落
  - 移行ツールと検証スクリプトを用意。移行後のデータ検証を実施
- 運用タイミングのズレ
  - 08:30〜08:50 の入力期間は UI/通知で厳格に周知。バッチの実行時間をサーバのタイムゾーンと合わせて設定

9) 次のステップ
- 本フォルダ構成をベースに、実装タスク分解（機能ごとのリポジトリ構成、ブランチ戦略、CI/CD 方針）へ落とし込み
- API仕様・データ辞書・UIモックの別ドキュメント化
- 雛形コードの提供（最小構成の雛形テンプレート、データ seeds、起動スクリプト）

ご希望があれば、実際のリポジトリレイアウトをもとに以下を追加で作成します。
- 実装用のサンプル雛形コード（Node.js + json-server連携の最小構成）
- package.json のスクリプト定義例（dev, build, seed など）
- Docker Compose の例（data-layer + api + frontend の簡易構成）

このフォルダ構成案をベースに、プロジェクトの実装計画書（SRS）や API仕様書、データ辞書、UIモックとセットで進めていきましょう。必要なら、各ディレクトリの初期ファイル・テンプレートも一緒に提供します。