# warikan-with-nextjs-supabase

割り勘計算・管理アプリケーション - Next.js + Supabase

## AI開発支援ツール利用時の注意事項

**重要**: Claude Code、Gemini CLI等のAI開発支援ツールを使用する際は、**すべてのやり取りを日本語で行ってください**。

## プロジェクト概要

このプロジェクトは、グループでの支払いを管理し、各メンバーの支払額と割り勘額を計算・追跡するWebアプリケーションです。Next.js App Routerを使用し、Supabaseをバックエンドとして認証とデータベース機能を提供しています。

### 主な機能

- **購入品の追加・編集**: タイトル、日付、メモとともに購入情報を登録
- **メンバー管理**: 割り勘メンバーの追加・削除
- **自動割り勘計算**: 支払額を入力すると自動で各メンバーの負担額を計算
- **精算状態管理**: 未精算/精算済みの管理
- **認証**: Supabase Authによるユーザー認証

## 技術スタック

### フレームワーク・ライブラリ

- **Next.js** (latest): React フレームワーク (App Router使用)
- **React** 18.2.0
- **TypeScript** 5.6.3
- **Supabase**:
  - `@supabase/supabase-js`: JavaScript クライアント
  - `@supabase/ssr`: Server-Side Rendering対応

### UI・スタイリング

- **Tailwind CSS** 3.4.1: ユーティリティファーストCSS
- **shadcn/ui**: Radix UIベースのコンポーネントライブラリ
  - Button, Table, Form, Dialog, Calendar, Tabsなど
- **next-themes**: ダークモード対応（実装済み）
- **lucide-react** / **@mdi/react**: アイコン

### 状態管理・フォーム

- **TanStack Query** (@tanstack/react-query) 5.49.2: サーバーステート管理
- **React Hook Form** 7.53.0: フォーム管理
- **Zod** 3.23.8: スキーマバリデーション
- **@conform-to/react** + **@conform-to/zod**: フォームバリデーション統合

### テスティング

- **Vitest**: コンポーネントテスト（`.comp.test.tsx`ファイル）
- **Playwright**: E2Eテスト（`tests/playwright/`）
- **MSW** (Mock Service Worker): APIモック
- **@testing-library/react**: React コンポーネントテスト

### 開発ツール

- **Biome**: リンター・フォーマッター
- **Lefthook**: Git フック管理
- **Volta**: Node.js バージョン管理 (v24.8.0)
- **Claude Code / Gemini CLI**: AI開発支援

## プロジェクト構成

```
.
├── app/                          # Next.js App Router
│   ├── (authenticated)/         # 認証が必要なページ
│   │   ├── page.tsx            # ホーム（購入品入力フォーム）
│   │   ├── unsettled/          # 未精算一覧ページ
│   │   ├── settled/            # 精算済み一覧ページ
│   │   ├── member/             # メンバー管理ページ
│   │   ├── purchase/[id]/edit/ # 購入品編集ページ
│   │   ├── _components/        # 共有コンポーネント
│   │   └── _hooks/             # カスタムフック
│   ├── (unauthenticated)/      # 認証不要なページ
│   │   └── login/              # ログインページ
│   ├── auth/callback/          # Supabase認証コールバック
│   ├── layout.tsx              # ルートレイアウト
│   └── global-error.tsx        # グローバルエラーハンドリング
│
├── components/                  # 共有コンポーネント
│   ├── ui/                     # shadcn/ui コンポーネント
│   ├── clients/                # クライアントコンポーネント
│   │   └── LoaderWithInert.tsx # Loader + inert制御（全画面ブロック用）
│   ├── AuthButton.tsx
│   ├── ErrorMessage.tsx
│   ├── Loader.tsx              # ローディング表示（Server Component対応）
│   └── NodataMessage.tsx
│
├── utils/                       # ユーティリティ
│   ├── supabase/               # Supabase クライアント設定
│   │   ├── client.ts           # クライアント用
│   │   ├── server.ts           # サーバー用
│   │   └── middleware.ts       # ミドルウェア用
│   └── types.ts                # 共通型定義
│
├── tests/                       # テスト
│   ├── playwright/             # E2Eテスト
│   └── mocks/                  # MSWハンドラー
│
├── database.types.ts           # Supabaseから生成された型定義
├── db_design_document.md       # ER図
└── middleware.ts               # Next.js ミドルウェア（認証チェック）
```

## データベース設計

### テーブル構成

#### `purchases` - 購入品テーブル
- `id` (int8, PK): 購入品ID
- `user_id` (uuid, FK): ユーザーID
- `title` (text): 購入品タイトル
- `purchase_date` (date): 購入日
- `note` (text): メモ
- `is_settled` (bool): 精算済みフラグ
- `created_at` (timestamp): 作成日時

#### `purchasers` - 割り勘メンバーテーブル
- `id` (int8, PK): メンバーID
- `user_id` (uuid, FK): ユーザーID
- `name` (text): メンバー名
- `created_at` (timestamp): 作成日時

#### `purchasers_purchases` - 購入品とメンバーの中間テーブル
- `id` (int8, PK): レコードID
- `user_id` (uuid, FK): ユーザーID
- `purchase_id` (int8, FK): 購入品ID
- `purchaser_id` (int8, FK): メンバーID
- `amount_paid` (int4): 支払額
- `amount_to_pay` (int4): 割り勘額

詳細なER図は `db_design_document.md` を参照。

## 主要な実装パターン

### 認証フロー

1. **ミドルウェア** (`middleware.ts`):
   - ログインページ以外の全ページで認証チェック
   - 未認証の場合は `/login` にリダイレクト
   - Supabaseセッションを更新

2. **Supabaseクライアント**:
   - **Server Component**: `utils/supabase/server.ts` - Cookie経由でセッション管理
   - **Client Component**: `utils/supabase/client.ts` - ブラウザでのセッション管理
   - **Middleware**: `utils/supabase/middleware.ts` - セッション更新

### データフェッチパターン

#### Server Component でのフェッチ
```tsx
// app/(authenticated)/_components/ServerForm.tsx
const ServerForm = async () => {
  const supabase = await createClient();
  const { data: purchasers } = await supabase
    .from("purchasers")
    .select("id, name")
    .order("created_at", { ascending: true });

  return <ClientForm initialPurchasers={purchasers} />;
};
```

#### Client Component でのフェッチ（TanStack Query）
```tsx
// app/(authenticated)/_hooks/usePurchaseForm.ts
const purchasersCache = useQuery({
  queryKey: ["purchasers"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("purchasers")
      .select("id, name");
    if (error) throw new Error(error.message);
    return data;
  },
  initialData: initialPurchasers,
});
```

### フォームバリデーション

**Zod スキーマ** (`app/(authenticated)/_hooks/purchaseFormSchema.ts`):
- タイトル必須、日付・メモ任意
- 支払額・割り勘額は非負整数または空文字列
- **カスタムバリデーション**: 支払額合計 = 割り勘額合計のチェック

```tsx
purchaseSchema.superRefine(({ purchasersAmountPaid, purchasersAmountToPay }, ctx) => {
  // 支払額と割り勘額の合計が一致するかチェック
  if (purchasersAmountPaidSum !== purchasersAmountToPaySum) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "支払額と割勘金額の合計が一致していません",
      path: ["purchasersAmountPaid", i, "amountPaid"],
    });
  }
});
```

### 状態管理

- **TanStack Query**: サーバーデータのキャッシュと同期
  - `queryKey: ["purchasers"]` - メンバー一覧
  - `queryKey: ["purchases"]` - 購入品一覧
- **React Hook Form**: フォーム状態管理
  - `useFieldArray`: 動的な配列フィールド（メンバーごとの支払額/割り勘額）
  - `watch`: リアルタイム合計金額計算

### 割り勘計算ロジック

**端数処理アルゴリズム** (`usePurchaseForm.ts:183-204`):
1. 支払額合計をメンバー数で割り、商と余りを算出
2. 全メンバーに商を割り当て
3. 余りをランダムに1円ずつ配分（公平性確保）

```tsx
const calculateDistributeRemainderRandomly = (amountPaidSum: number) => {
  const quotient = Math.floor(amountPaidSum / purchasers.length);
  let remainder = amountPaidSum % purchasers.length;

  const distribution = purchasers.map(() => ({ amountToPay: quotient }));

  while (remainder > 0) {
    const randomIndex = Math.floor(Math.random() * purchasers.length);
    distribution[randomIndex].amountToPay += 1;
    remainder--;
  }

  purchasersAmountToPayReplace(distribution);
};
```

## テスト構成

### コンポーネントテスト（Vitest）

- **設定**: `vitest.config.ts`
- **テストファイル**: `*.comp.test.tsx`
- **環境**: jsdom + @testing-library/react
- **モック**: MSW (`tests/mocks/handlers.ts`)

### E2Eテスト（Playwright）

- **設定**: `playwright.config.ts`
- **テストファイル**: `tests/playwright/*.e2e.test.ts`
- **認証セットアップ**: `tests/playwright/auth.setup.e2e.test.ts`
  - ログイン状態を `.auth/user.json` に保存し再利用
- **ハッピーパス**: `tests/playwright/happypath.e2e.test.ts`

## 開発フロー

### セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local に Supabase の URL と ANON_KEY を設定

# 開発サーバー起動
npm run dev
```

### 主要コマンド

```bash
# 開発
npm run dev              # 開発サーバー起動（localhost:3000）

# ビルド・本番
npm run build            # 本番ビルド
npm start                # 本番サーバー起動

# コード品質
npm run tsc              # 型チェック
npm run biome:check      # Biome リント・フォーマットチェック
npm run biome:format     # Biome 自動フォーマット
npm run check            # tsc + biome:check を順次実行

# テスト
npm run test:comp        # コンポーネントテスト実行
npm run test:comp:watch  # コンポーネントテスト（watch モード）
npm run test:e2e         # E2Eテスト実行
npm run test:e2e:ui      # E2Eテスト（UIモード）

# AI開発支援
npm run claude           # Claude Code 起動
npm run gemini           # Gemini CLI 起動
npm run gemini:flash     # Gemini Flash モデル使用
```

### Git フック（Lefthook）

`lefthook.yml` で以下を設定:
- **pre-commit**: `npm run check` 実行（型チェック + リント）

## 環境変数

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## コーディング規約

### ファイル命名規則

- **Page**: `page.tsx`
- **Layout**: `layout.tsx`
- **Server Component**: `Server*.tsx`（例: `ServerForm.tsx`）
- **Client Component**: `Client*.tsx`（例: `ClientForm.tsx`）
- **Component Test**: `*.comp.test.tsx`
- **E2E Test**: `*.e2e.test.ts`

### コンポーネント設計

- **Server Component優先**: データフェッチは基本的にServer Componentで実施
- **Props Drilling回避**: Server ComponentでフェッチしたデータをinitialDataとしてClient Componentに渡す
- **カスタムフック**: ビジネスロジックは `_hooks/` ディレクトリに切り出し
- **責務分離**: バリデーションスキーマ・初期値生成ロジックは外部ファイル化

### ローディング表示の使い分けガイド

#### 全画面ローディング

##### Loaderコンポーネント (`components/Loader.tsx`)
- **用途**: データフェッチ中の通常のローディング表示
- **特徴**: 画面オーバーレイだが操作ブロックなし
- **使用場所**:
  - `useQuery`の`isLoading`条件分岐
  - 一覧画面のリフレッシュ時

```tsx
if (purchasesCache.isLoading) return <Loader />;
```

##### LoaderWithInertコンポーネント (`components/clients/LoaderWithInert.tsx`)
- **用途**: 操作ブロックが必要な重要処理中
- **特徴**: `inert`属性で全画面操作を完全ブロック
- **使用場所**:
  - `loading.tsx`（ページ遷移）
  - Server Actions実行中（`useTransition`の`isPending`）
  - データ整合性が重要なMutation中

```tsx
// loading.tsx
export default function Loading() {
  return <LoaderWithInert />;
}

// Server Action実行中
{isPending && <LoaderWithInert />}
```

#### ボタン内インラインローディング

**規約**: `Loader2`アイコン (lucide-react) を標準とする

- **理由**:
  - 他のアイコン（Edit, Trash, Check等）と一貫性
  - サイズ調整が容易（`h-4 w-4`等のクラス）
  - `animate-spin`で簡潔に実装可能
- **必須事項**: 全てのMutationで`mutation.isPending`を使用してボタンを制御すること

**実装パターン**:

```tsx
// テキストボタンの場合（非推奨 - 可能な限りアイコンを使用）
<Button
  onClick={() => mutation.mutate(data)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? "処理中..." : "実行"}
</Button>

// アイコンボタンの場合（推奨）
<Button
  onClick={() => mutation.mutate(data)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Check className="h-4 w-4" />
  )}
</Button>

// DropdownMenuItemでのLoader2使用例
<DropdownMenuItem
  onClick={() => mutation.mutate(data)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    "実行"
  )}
</DropdownMenuItem>
```

### 型定義

- **Database型**: `database.types.ts`（Supabase CLIで自動生成）
- **共通型**: `utils/types.ts`
- **ローカル型**: 各ファイル内で `type` / `interface` 定義

## 既知の制約・TODO

- [ ] **トランザクション処理未実装**:
  - `purchases` と `purchasers_purchases` の挿入/更新が別々のクエリで実行
  - エラー時のロールバック処理が不完全（手動削除が必要）
  - 参照: `app/(authenticated)/_hooks/usePurchaseForm.ts:77-81`, `128-131`

- [ ] **リアルタイム更新未対応**:
  - 複数ユーザー同時編集時の競合解決なし

- [ ] **ページネーション未実装**:
  - 購入品が多い場合のパフォーマンス懸念

## トラブルシューティング

### 認証エラー

- **症状**: ログインできない、セッションが切れる
- **対処**:
  1. `.env.local` のSupabase認証情報を確認
  2. ブラウザのCookieをクリア
  3. Supabaseダッシュボードでユーザーが存在するか確認

### ビルドエラー

- **型エラー**: `npm run tsc` で型チェック、`database.types.ts` が最新か確認
- **依存関係エラー**: `npm install` 再実行、`node_modules` 削除後再インストール

### テスト失敗

- **E2Eテスト**: 開発サーバーが起動しているか確認（`npm run dev`）
- **コンポーネントテスト**: MSWモックが正しく設定されているか確認

## 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Zod Documentation](https://zod.dev/)
