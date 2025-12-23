# 要件定義書（更新版）: 弁当注文管理システム
- 対象技術: Node.js + json-server
- 想定ユーザ数: 約20名（管理者2名含む）
- 拠点: 1拠点
- 日次・月次運用の運用フローを反映
- 目的: 正確な発注量・請求状況の把握と確定タイムの厳格運用

日付
- 作成日: 2025-12-23
- 改訂日: 最新反映日

1. 背景と目的
- 現行のExcelベース運用をデジタル化し、日次の確定・配送準備・支払管理の透明性と作業効率を向上させる。
- 日次の注文は08:30〜08:50の事前入力窓を経て、09:30に確定（ロック）する運用を厳格に適用する。
- 月次では前月分の請求を月初に通知する仕組みを実装し、確定タイミングで通知を行う。
- 紙とデジタルの併用を想定する運用を維持しつつ、将来のデジタル完結へ移行可能な設計とする。

2. 関係者と役割
- 一般ユーザ（general）
  - 自分の注文の入力・閲覧・請求情報の確認を担当
- 管理者（admin）
  - 注文確定・ロック処理、請求通知、印刷データ生成、支払管理、献立管理、監査ログの確認を担当
- システム
  - json-server をデータ層として利用
  - Node.js アプリがビジネスロジックを実行、認証・認可・通知・データ連携を担当

3. 用語集
- 注文データ（orders）
  - user_id, date, menu_item_id, price, status, locked_at, picked_up などを含む
- 献立情報（menu_items）
  - date と紐づく献立情報（name, description, price, content_ref = PDF/URL）
- 請求情報（payments）
  - month, amount, paid, confirmed などを含む
- 監査ログ（audit_logs）
  - 操作履歴の追跡用データ
- 配送関連（delivery_schedule）
  - 日次の配送補助情報を保持

4. アーキテクチャ概要
- json-server（データ層）
  - db.json に以下のコレクションを格納
    - users, orders, menu_items, payments, audit_logs, delivery_schedule
- Node.js アプリ（ビジネスロジック層・API層）
  - 認証・認可、09:30 ロック処理、日次・月次のワークフロー、印刷データ生成、献立参照、通知入口
  - json-server の REST API を介してデータ操作を実施
- フロントエンド
  - ブラウザベースのUI（認証後に使用）
  - json-server へデータ操作を行うクライアント機能を提供

5. データモデル設計（db.json 想定形）
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
  - locked_at: string (ISO timestamp; 09:30以降は locked)
  - picked_up: boolean
  - picked_up_at: string (ISO timestamp)

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

- delivery_schedule（配送補助情報）
  - delivery_id: string (PK)
  - date: string (YYYY-MM-DD)
  - status: string
  - notes: string

6. 09:30 確定・ロックの動作ルール
- orders.status = "pending" の日付別レコードを、09:30 時点で全件 "locked" に更新
- locked_at を設定。以降の更新は不可
- 現時点での「再変更期間」は設定可能なフラグとして用意（運用ルールに応じて有効化）
- 09:30 確定後は集計データの生成は任意（印刷データ生成のみが必要な場合はこの時点で生成）

7. 機能要件（詳細）

7-1 共通機能
- 認証・認可
  - ログイン／ログアウト
  - ロール: general, admin
  - セッションまたはトークンベースの認証
- ダッシュボード
  - 本日・今月の状況サマリ、未処理の注文、支払状況のサマリを表示
- データ連携
  - json-server への CRUD 操作を Node.js アプリが仲介

7-2 一般ユーザ向け機能
- 月間入力モード（ひと月分を登録・編集）
  - 日付ごとに弁当を選択（献立情報と紐づく）
  - 09:30 確定日を過ぎた日付は編集不可（ロック）
  - 入力テンプレは日付別。献立は menu_items への紐付け
- 献立参照
  - 日付ごとに献立PDFまたは献立URLを表示
- 請求情報参照
  - 自分の前月分請求額・支払状況を閲覧
- 確認通知（任意）
  - 月初の請求確定通知、未払い通知の通知設定

7-3 管理者向け機能
- 日次の注文確定処理
  - 09:30 時点の pending を lock へ変更
  - ロック後の更新制御、必要に応じて印刷データの生成
- 印刷データ（紙リスト）生成機能
  - 当日分の注文者一覧を印刷用データとしてエクスポート（CSV／PDF）
  - 配置用リスト作成（部門・名前・注文内容を含む）
- 献立管理
  - 献立情報の登録・更新（PDFアップロード or URL 登録）
- 請求管理
  - 前月分の請求状況を確認・未払い者の抽出
  - 請求確定後の通知トリガー設定
- 月次処理
  - 月初の請求通知（前月分の請求額が確定したタイミングで通知）
  - 月中旬の振込手続き
- レポート・通知
  - 日次/月次レポートは不要。必要最低限の通知機能を用意
- データエクスポート
  - Excel/CSV形式でのエクスポート機能

8. 非機能要件
- パフォーマンス
  - 小規模想定（20名程度）。将来的な拡張にも耐える設計
- 可用性
  - バックアップ手順、ログ監視、障害対応マニュアルを整備
- セキュリティ
  - 内部ネットワーク限定、認証と権限管理の徹底、データ保護
- 移行性
  - 現行Excelデータからの移行ツールを提供
- 互換性
  - Excel/CSV のインポート・エクスポート対応
- ログ/監査
  - 監査ログを常時収集・閲覧可能

9. API設計の要点（REST 概要）
- 認証
  - POST /auth/login
- ユーザー/献立
  - GET /users
  - GET /menu_items?date=YYYY-MM-DD
  - POST /menu_items
  - PUT/PATCH /menu_items/{id}
- 注文
  - GET /orders?date=YYYY-MM-DD
  - POST /orders
  - PATCH /orders/{order_id}
  - PUT /orders/{order_id}
- 支払・請求
  - GET /payments?month=YYYY-MM
  - PATCH /payments/{payment_id}
- 配送/印刷
  - GET /delivery_schedule
  - POST /delivery_schedule
  - GET /print/daily_order_list?date=YYYY-MM-DD
- 監査
  - GET /audit_logs
- インポート/エクスポート
  - POST /import/excel
  - GET /export/excel?type=orders|payments|audit

10. 画面・UIの概要（UIモックは後述）
- ログイン画面
- ダッシュボード
  - 本日/今月の集計サマリと未確定・未払いの状況
- 一般ユーザ画面
  - 月間ビュー: 月全体の入力状況を一覧表示
  - 日別ビュー: 日付を選択して注文を入力／編集
  - 献立参照ページ
  - 請求情報ページ
- 管理者画面
  - 09:30 確定ボタン（実行時点で pending → locked へ）
  - 当日分の印刷データ生成／ダウンロード
  - 献立管理ページ
  - 支払管理ページ（未払い者の抽出・確認・通知設定）
  - データエクスポート機能
- 通知・アラート
  - 請求確定時通知（前月分の請求が確定した時点で通知）
  - 未払い通知（設定により通知）

11. データ移行計画
- 旧Excelデータの JSON 変換テンプレ案を用意
- 移行手順
  - 1) ユーザー登録と権限設定の移行
  - 2) 注文データの date/献立紐付けの正規化
  - 3) 献立情報の pdf/URL の紐付け
  - 4) 請求データの初期値設定（未払い/未確定）
- 移行検証
  - データ整合性チェック（行/列の対応、日付の正規化、金額の整合性）

12. テスト計画
- レベル別テスト
  - 単体テスト: 各 API の CRUD、ロック処理、通知トリガの検証
  - 結合テスト: 一般ユーザ → 管理者のワークフロー全体の検証
  - UAT: 実務担当者による運用シミュレーション
  - 回帰テスト: 変更時の既存機能影響をチェック
- 非機能テスト
  - パフォーマンステスト、セキュリティレビュー、バックアップ検証

13. 導入・運用の運用手順
- 環境構築
  - json-server のセットアップ（db.json の準備）
  - Node.js アプリのセットアップと認証・ビジネスロジックの実装
- 運用手順
  - 08:30〜08:50 の入力期間の周知
  - 09:30 の確定処理の実行手順とロックの運用ルール
  - 11:30 配送開始、12:00〜13:00 昼休憩、14:00 配送容器引き上げ
  - 月初の請求通知、月中旬の振込手続きの手順
- バックアップとリカバリ
  - バックアップ頻度・保管先・リストア手順の運用
- セキュリティ運用
  - ロール管理、認証/認可、監査ログの保存ポリシー

14. 移行と受け入れ基準
- 受け入れ基準
  - 09:30 確定がロックされることを検証済み
  - 08:50 までに入力された注文が反映され、09:30 に確定されること
  - 月初通知が正しくトリガーされること
  - 未払いの抽出・通知が動作すること
  - 印刷データ（当日分の注文者一覧）生成機能が動作すること（任意の場合は後回し可）
- リスクと対策
  - 外部ネットワーク接続のばらつき: 内部ネットワーク内で完結する設計
  - データ整合性の崩壊: 監査ログ・トランザクション整合性の確保、ロック機構の厳格化
  - 移行時のデータ欠損: バリデーションと検証用のツールを用意

15. 将来の拡張性
- ネット注文連携の検討（弁当屋の API 連携）
- 請求のオンライン決済オプションの検討
- 複数拠点対応（現状1拠点からの設計を拡張可能なモジュール構成）

16. 提供物リスト
- 要件定義書（本ドキュメント、Markdown形式）
- DB設計・データ辞書（db.json の雛形と説明）
- API仕様（各エンドポイントの概要とパラメータ/レスポンス例）
- 移行ガイド（Excel → JSON 変換手順）
- 環境構築ガイド（セットアップ手順、推奨構成）
- テスト計画書とテストケース例
- 運用マニュアル（09:30 ロック運用、請求通知、印刷データの生成手順）

18. 合意・受領条件
- 顧客側の承認を得た時点で実装フェーズに移行
- 初期データのインポート・検証完了を以後の受け入れ条件として設定

次のアクション案
- 本要件定義書をベースに、API仕様書、データ辞書、UIモックを分割して作成
- プロトタイプの雛形コード（Node.js + json-server）とデータモデルのサンプルを提供
- 08:30〜09:30 の入力・確定の取り扱いを自動化するバッチの仕様を具体化

ご要望があれば、以下を追加で作成します
- API仕様書（OpenAPI風に詳細化）
- データ辞書（全テーブルの各カラム定義・制約・バリデーションルール）
- UIモック（画面遷移図・ワイヤーフレームのテキスト版）
- 実装ガイド（雛形コード・ディレクトリ構成案）

この要件定義書をベースに、実装タスク分解（PM/開発者用のタスク一覧）へ落とし込むことも可能です。ご希望の形式（追加ドキュメントの有無、詳細レベル、優先機能の絞り込み）をお知らせください。