# 仕様書: 弁当注文管理システム (Node.js + json-server) — 更新版

日付: 2025-12-23

目的
- 日次・月次の弁当注文を一元管理し、発注量・請求状況を把握する。
- 注文確定は09:30に固定化（変更不可）とすることで、調理・配送・現場の作業を円滑化する。
- 少人数・拠点1拠点で、将来的な拡張を見据えた最小構成を維持する。

前提条件・制約
- ユーザ数: 約20名（うち管理者2名）
- 拠点: 1拠点
- 使用環境: Node.js + json-server
- 現状は Excel 運用をデータ層として置き換え、データは json-server の db.json に格納
- セキュリティは社内ネットワーク前提。認証は簡易的なトークン方式を推奨（Node.js サーバ経由での認証を実装推奨）

全体アーキテクチャ案（現状の構成を維持）
- json-server: データ層のREST API
  - ポート例: 3000
  - db.json に格納するデータ種別例: users, orders, menu_items, payments, audit_logs, delivery_schedule など
- Node.js アプリ（小規模 API層/ビジネスロジック層）:
  - ポート例: 8080
  - 認証・認可、09:30 ロック処理、月次請求通知、印刷データ生成、献立参照の統合、外部通知の入口
  - json-server へのデータ操作は REST API 経由で実施
- フロントエンド
  - ブラウザベースのUI。Node.js アプリ経由で認証後、json-serverへデータ操作
  - 献立PDF/URLリンクの参照、請求額の閲覧、印刷データの取得などを提供

データモデル概要（db.json 想定形）
- users
  - user_id: string (PK)
  - name: string
  - email: string
  - password_hash: string
  - role: "general" | "admin"
  - status: "active" | "inactive"

- orders（日次の個人別注文データ）
  - order_id: string (PK)
  - user_id: string (FK -> users.user_id)
  - date: string (YYYY-MM-DD)
  - menu_item_id: string (FK -> menu_items.menu_item_id)
  - price: number
  - status: "pending" | "finalized" | "locked"
  - locked_at: string (ISO timestamp; 09:30 以降は locked)

- menu_items（献立情報。PDF/URL 参照を含む）
  - menu_item_id: string (PK)
  - date: string (YYYY-MM-DD)
  - name: string
  - description: string
  - price: number
  - content_ref: string (pdf_link または url)

- payments（月次の請求・支払状況）
  - payment_id: string (PK)
  - user_id: string (FK -> users.user_id)
  - month: string (YYYY-MM)
  - amount: number
  - paid: boolean
  - paid_at: string (ISO timestamp)
  - confirmed: boolean
  - confirmed_at: string (ISO timestamp)

- audit_logs（操作監査ログ）
  - log_id: string (PK)
  - user_id: string (FK -> users.user_id)
  - action: string
  - target_table: string
  - target_id: string
  - timestamp: string (ISO)
  - details: string

- 注記
  - 09:30 確定・ロックは orders.status と locked_at で判定
  - 請求の「確定」タイミングで users へ通知する仕組みを payments.confirmed フラグで表現

運用ワークフロー（更新版：日次・月次）

日次
- 08:30〜08:50: 事前準備（一般ユーザ注文入力）
  - 一般ユーザはこの窓内に、当日分の注文を入力・修正する
  - 入力テンプレートは日付別、献立は menu_items の日付対応と紐づく
- 09:30: 確定処理
  - central logic が 09:30 時点の未確定注文（orders.status = "pending"）をすべて "locked" に変更
  - locked_at を設定し、それ以降の更新を不可とする
  - 注文量の集計は原則不要。必要な場合は「印刷用データ」だけを生成する（任意）
- 11:30頃: 弁当屋の配送開始
- 12:00〜13:00: 昼休憩
  - ユーザは自分の名前にマークを付け、弁当を取る
  - 現状は紙リストのマークとデジタルの picked_up 状態を併用する運用を推奨
  - デジタル側では picked_up フラグ/時間を更新する方法を用意するのが望ましい
- 14:00頃: 配送容器引き上げ
- 日次集計は不要
  - 指定の「日時別集計」は不要として整理

月次
- 月初
  - 前月分の請求額を一般ユーザへ通知
  - この通知は、payments の confirmed が true になったタイミングで送信する設計とする
  - 一般ユーザは請求金額を確認したい時にいつでも閲覧可能（ダッシュボード/請求閲覧）
- 月中旬
  - 管理者が弁当屋へ振込手続き
- 月次レポート不要
  - 月次レポート生成の機能は除外

補足事項
- 請求通知タイミング
  - 請求データ（payments）の confirmed フラグを更新した時点で通知を送信する。
  請求額は「確定した時点」で公式に通知され、以後は閲覧可能。
- 紙とデジタルの整合性
  - 12:00〜13:00 の間は紙のマークとデジタルの picked_up 状態を照合して整合性を取る運用を推奨。
  - 将来的にはデジタルの pick_up 状態へ統一することを検討しても良い。
- 夏冬時間・タイムゾーン
  - JST（日本標準時）を基準とする。夏時間は日本国内では実質的に影響しないため、JST のまま運用。
- セキュリティ
  - 社内網前提。認証はトークンベースを想定。最小限の権限分離（admin vs general）。
- 移行と拡張
  - 現状の Excel からのデータ移行ツールを用意。将来的な API 拡張を前提とする設計。

データ連携・ API 概要（Node.js + json-server の組み合わせ想定）
- json-server はデータ層として db.json の REST API を提供
- Node.js アプリは認証・ビジネスロジックを担当
  - 09:30 ロック処理、印刷データ生成、請求通知、献立参照、外部通知の入口
  - 日次・月次のバッチをスケジュール化して実行可能
- エンドポイント例（概略）
  - POST /auth/login：認証
  - GET /orders?date=YYYY-MM-DD
  - POST /orders：新規注文
  - PUT /orders/{order_id} / PATCH /orders/{order_id}：更新（ロック前提の際は制約を適用）
  - GET /menu_items?date=YYYY-MM-DD
  - POST /menu_items：献立登録
  - GET /payments?month=YYYY-MM
  - PATCH /payments/{payment_id}：confirmed/paid 状態の更新
  - GET /audit_logs：監査ログ閲覧

導入・運用の留意点
- 初期導入時は Excel からのデータ移行を丁寧に実施。移行後は db.json の整合性を保つ。
- 08:50 までの入力締切を厳格運用するため、前後のフローを UI・通知で周知する。
- 印刷データ生成は任意とし、必要に応じて PDF/CSV 出力機能を組み込む。
- 請求通知は自動通知とし、ユーザ側の閲覧画面で確認できるようにする。
- 月次レポートは不要との方針を反映し、レポート機能を除外。

次のステップ案
- 更新した運用フローを実装仕様として落とす（要件定義書レベルへ）
- db.json の初期データ設計（users, orders, menu_items, payments の雛形作成）
- 認証・権限の最小実装（admin vs general）
- 08:30-09:30 の入力・確定のタイムアウト・検証機能の実装方針決定
- アーキテクチャの簡易図と API 定義を追加で作成

必要であれば、本仕様をもとに「要件定義書(SRS)」「API仕様書」「データ辞書」「UIモック」の追加ドキュメントを Markdown 形式で作成します。ご希望があれば、現状のコード雛形（Node.js + json-server の雛形一式）も提供します。