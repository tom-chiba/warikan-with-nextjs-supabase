# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

割り勘管理アプリケーション（warikan）- Next.js App Router + Supabase構成

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run tsc

# リンター（Biome）
npm run biome:check       # チェックのみ
npm run biome:format      # 自動修正

# 型チェック + リンター（一括実行）
npm run check

# コンポーネントテスト（Vitest）
npm run test:comp         # 単発実行
npm run test:comp:watch   # ウォッチモード

# E2Eテスト（Playwright）
npm run test:e2e          # 実行
npm run test:e2e:ui       # UIモード

# ビルド
npm run build
```

## アーキテクチャ

### ディレクトリ構成

- `app/` - Next.js App Routerのページ
  - `(authenticated)/` - 認証必須ページ（メイン機能）
  - `(unauthenticated)/` - 認証不要ページ（ログイン）
- `components/` - 共通コンポーネント
  - `ui/` - shadcn/ui基盤のUIコンポーネント
  - `clients/` - Client Component専用（例: LoaderWithInert）
- `utils/supabase/` - Supabaseクライアント（server/client/middleware）
- `tests/` - テスト関連
  - `vitest/` - コンポーネントテスト設定
  - `playwright/` - E2Eテスト
  - `mocks/` - MSWモック

### Server/Client Componentパターン

ページは`Server` + `Client`ペアで構成:
- `ServerXxx.tsx` - データフェッチ（Server Component）
- `ClientXxx.tsx` - インタラクション（Client Component）

```tsx
// Server Component: データ取得
const ServerForm = async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("purchasers").select("*");
  return <ClientForm initialPurchasers={data} />;
};

// Client Component: 状態管理とUI
const ClientForm = ({ initialPurchasers }) => {
  // useQuery, useMutation等でデータ操作
};
```

### Loaderコンポーネントの使い分け

- `<Loader />` - Query実行中（ユーザー操作可能）
- `<LoaderWithInert />` - Mutation実行中（操作ブロック）

```tsx
{isLoading && <Loader />}           // データ取得中
{isPending && <LoaderWithInert />}  // データ更新中（inert属性付与）
```

### データフェッチ（TanStack Query）

Server Componentで初期データ取得、Client ComponentでuseQuery/useMutationを使用:

```tsx
const cache = useQuery({
  queryKey: ["purchases", "unsettled"],
  queryFn: async () => supabase.from("purchases").select("*"),
  initialData: initialPurchases,  // Server Componentから渡す
});
```

## テスト

### コンポーネントテスト

- ファイル命名: `*.comp.test.tsx`
- MSWでSupabase APIをモック
- `TSQWrapper`でQueryClientProviderをラップ

```tsx
import { render, screen } from "@testing-library/react";
import { TSQWrapper, user } from "@/tests/vitest/setup";

test("example", async () => {
  render(<Component />, { wrapper: TSQWrapper });
  await user.click(screen.getByRole("button"));
});
```

### E2Eテスト

- ファイル命名: `*.e2e.test.ts`
- 認証状態は`tests/playwright/.auth/user.json`にキャッシュ

## データベース設計

3テーブル構成（詳細は`db_design_document.md`参照）:
- `purchases` - 購入情報
- `purchasers` - メンバー情報
- `purchasers_purchases` - 中間テーブル（支払額・割勘額）

## Git Hooks (Lefthook)

pre-commit時に自動実行:
1. `npm run tsc` + `npm run biome:check`（並列）
2. `npm run build`

## ADR (Architecture Decision Records)

設計判断は`docs/adr/`に記録。新規ADRは連番で追加。
