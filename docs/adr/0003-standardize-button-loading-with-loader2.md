# 0003. ボタン内ローディング表示をLoader2アイコンで統一

日付: 2025-10-05

## ステータス

Accepted

## コンテキスト

ボタン内のローディング表示に以下の2つの実装パターンが混在していた：

1. **テキストベース**: "処理中..."、"精算中..."、"削除中..." などの文字列表示
2. **アイコンベース**: `Loader2`（lucide-react）のスピナーアイコン

この不統一により、以下の問題が発生していた：
- UI/UXの一貫性が欠如
- コードレビュー時に判断基準が不明確
- 新規実装時にどちらのパターンを採用すべきか迷う

実装箇所：
- `app/(authenticated)/unsettled/_components/ClientControlMenu.tsx`: テキスト表示
- `app/(authenticated)/settled/_components/ClientControlMenu.tsx`: テキスト表示
- `app/(authenticated)/member/_components/ClientPurchasersTable.tsx`: Loader2アイコン（既存）

## 決定

ボタン内インラインローディング表示を**`Loader2`アイコン（lucide-react）で統一**する。

```tsx
// 標準パターン
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
```

実装箇所：
- `app/(authenticated)/unsettled/_components/ClientControlMenu.tsx:60, 74`
- `app/(authenticated)/settled/_components/ClientControlMenu.tsx:60, 74`
- `.claude/CLAUDE.md:358-402`（規約として文書化）

## 理由

### 1. 視覚的一貫性

- 他のアイコン（Edit, Trash, Check等）と統一されたデザイン言語
- アイコンサイズ（`h-4 w-4`）とアニメーション（`animate-spin`）で統一
- lucide-reactは既にプロジェクトの依存関係として存在

### 2. UI/UXの向上

- スピナーアイコンはローディング状態を直感的に表現
- テキストよりも視覚的に目立ちやすい
- 多言語対応時にテキスト翻訳が不要

### 3. コードの保守性

- 実装パターンが統一され、コードレビューが容易
- 新規実装時の判断基準が明確
- 既存のClientPurchasersTableと同じパターンで一貫性を確保

### 4. 実装の簡潔性

- lucide-reactのLoader2をimportするだけで実装可能
- 追加のCSSやコンポーネント作成が不要

## 結果

### 良い影響

- ✅ ボタン内ローディング表示がプロジェクト全体で統一
- ✅ UI/UXの一貫性が向上
- ✅ コーディング規約として明文化（CLAUDE.md）
- ✅ 新規実装時の迷いが解消
- ✅ 既存のアイコンシステムとの親和性が高い

### 悪い影響・トレードオフ

- ⚠️ テキスト表示のほうが状態を明確に伝えられる場合がある
  - 対策: アクセシビリティのため`aria-label`やtooltipで補完可能
- ⚠️ アイコンのみだとローディング理由（精算中/削除中）が不明確
  - 対策: ボタン配置と文脈で判断可能（ドロップダウンメニュー内）
- ⚠️ 既存のテキストベース実装を修正する必要がある
  - 対策: TDDアプローチで段階的に修正済み

## 代替案

### 1. テキストベースのローディング表示を継続

```tsx
{mutation.isPending ? "処理中..." : "実行"}
```

**採用しなかった理由**:
- 他のアイコンボタンと視覚的に不統一
- 多言語対応時にテキスト翻訳が必要
- ClientPurchasersTableとの一貫性が取れない

### 2. 自前のLoaderコンポーネントを使用

```tsx
{mutation.isPending ? <Loader className="inline" /> : "実行"}
```

**採用しなかった理由**:
- `Loader`コンポーネントは全画面オーバーレイ用途
- ボタン内での使用は想定外（サイズ調整が困難）
- lucide-reactで十分に代替可能

### 3. アイコンとテキストを併用

```tsx
{mutation.isPending ? (
  <>
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>処理中...</span>
  </>
) : "実行"}
```

**採用しなかった理由**:
- ボタン内のスペースが限られている
- 視覚的に冗長
- DropdownMenuItemでは特にスペースが不足

## 関連する決定

- **0002. Loaderコンポーネントの責務分離とServer Component対応**
  - 全画面ローディングとボタン内ローディングの使い分けを明確化
  - `Loader`/`LoaderWithInert`は全画面用、`Loader2`はボタン内用

## 実装詳細

### 変更ファイル

- `app/(authenticated)/unsettled/_components/ClientControlMenu.tsx`
- `app/(authenticated)/settled/_components/ClientControlMenu.tsx`
- `.claude/CLAUDE.md`

### テストケース

- 精算mutation実行中、Loader2アイコンが表示される
- 削除mutation実行中、Loader2アイコンが表示される
- 未精算mutation実行中、Loader2アイコンが表示される

### 今後の対応

新規実装時は`.claude/CLAUDE.md`の「ボタン内インラインローディング」セクションを参照し、`Loader2`アイコンを使用すること。
