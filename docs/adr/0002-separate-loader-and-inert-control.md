# 0002. Loaderコンポーネントの責務分離とServer Component対応

日付: 2025-10-05

## ステータス

Accepted

## コンテキスト

従来の `Loader` コンポーネントは以下の問題を抱えていた：

1. **二重の表示制御**: `isLoading` propsによる内部制御と、親コンポーネントでの条件分岐が共存
2. **Client Component固定**: `useEffect` でDOM操作を行うため、Server Componentとして使用不可
3. **責務の混在**: ローディング表示とinert制御（全画面ブロック）が同一コンポーネント内に存在

```tsx
// 従来の問題のあるパターン
<Loader isLoading={isPending} />  // propsで制御
{isPending && <Loader isLoading />}  // 親でも制御（二重管理）
```

実装箇所: `components/clients/Loader/index.tsx` (削除前)

## 決定

Loaderコンポーネントを2つに分離し、責務を明確化した：

1. **`Loader`** (`components/Loader.tsx`):
   - Server Component対応
   - propsなし（`className` のみオプション）
   - 純粋なローディング表示のみ
   - 親コンポーネントが表示/非表示を制御

2. **`LoaderWithInert`** (`components/clients/LoaderWithInert.tsx`):
   - Client Component
   - `useEffect` で `document.body` に `inert` 属性を付与
   - 全画面ブロックが必要な場合のみ使用
   - 内部で `<Loader />` を使用

```tsx
// 新しいパターン
{isLoading && <Loader />}           // Query中（inertなし）
{isPending && <LoaderWithInert />}  // Mutation中（inertあり）
```

## 理由

### 1. Server Component対応の実現

- Next.js App Routerでは、可能な限りServer Componentを使用すべき
- `Loader` をServer Componentにすることで、`loading.tsx` で使用可能
- ビルドサイズの削減とパフォーマンス向上

### 2. 単一責任原則の遵守

- `Loader`: ローディング表示のみ
- `LoaderWithInert`: inert制御のみ
- それぞれが明確な責務を持つ

### 3. props削減による柔軟性向上

- `isLoading` propsを廃止し、親コンポーネントで完全制御
- カスタマイズが必要な場合は `className` propsで対応
- 表示/非表示の判断ロジックが親に集約され、見通しが良い

### 4. 適材適所の使い分け

- **Query実行中**: データ取得中でユーザー操作は可能 → `<Loader />` (inertなし)
- **Mutation実行中**: データ更新中で操作をブロック → `<LoaderWithInert />` (inertあり)

## 結果

### 良い影響

- ✅ Server Componentとして使用可能（`loading.tsx` で利用）
- ✅ コード量削減（61行減）
- ✅ 責務が明確で理解しやすい
- ✅ テストが書きやすい（関心事が分離されている）
- ✅ 親コンポーネントでの制御が統一的

### 悪い影響・トレードオフ

- ⚠️ コンポーネント数が増加（1 → 2）
- ⚠️ 開発者が適切なコンポーネントを選択する必要がある
  - 対策: ドキュメント（CLAUDE.md）に使い分けを明記

## 代替案

### 1. propsで制御を継続

```tsx
<Loader isLoading={isPending} withInert />
```

**採用しなかった理由**:
- Server Component対応が困難
- props が増えて複雑化
- 条件分岐ロジックがコンポーネント内部に隠蔽される

### 2. 単一のLoaderコンポーネントでContext経由で制御

```tsx
<LoaderContext.Provider value={{ withInert: true }}>
  <Loader />
</LoaderContext.Provider>
```

**採用しなかった理由**:
- 過度な抽象化
- Context API のオーバーヘッド
- デバッグが困難

### 3. CSS Classでのinertエミュレーション

```tsx
<Loader className="pointer-events-none" />
```

**採用しなかった理由**:
- `inert` 属性の本来の目的（アクセシビリティ）が失われる
- キーボード操作のブロックが不完全

## 関連する決定

なし

## 実装箇所

- `components/Loader.tsx`: 新規作成
- `components/clients/LoaderWithInert.tsx`: 新規作成
- `components/Loader.comp.test.tsx`: テスト
- `components/clients/LoaderWithInert.comp.test.tsx`: テスト

## 影響範囲

**更新されたファイル**:
- `app/(authenticated)/loading.tsx`
- `app/(authenticated)/unsettled/loading.tsx`
- `app/(authenticated)/providers.tsx`
- `app/(unauthenticated)/login/_components/ClientLoginForm.tsx`
- `app/(authenticated)/unsettled/_components/ClientUnsettledTable.tsx`
- `app/(authenticated)/settled/_components/ClientSettledTable.tsx`

**削除されたファイル**:
- `components/clients/Loader/index.tsx`
- `components/clients/Loader/index.module.css`
- `components/clients/Loader/Loader.comp.test.tsx`
