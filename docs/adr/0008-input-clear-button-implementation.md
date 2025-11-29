# 0008. 金額入力欄のクリアボタン実装方式

日付: 2025-11-29

## ステータス

Accepted

## コンテキスト

金額入力欄（支払額・割勘金額）に、ユーザーがワンクリックで値をクリアできる×ボタンを追加する要件があった。

shadcn/uiには「Input Group」コンポーネントがあり、入力欄にアドオン（ボタンやアイコン）を追加する機能を提供している。このコンポーネントの使用を検討した。

## 決定

shadcn/ui Input Groupを使用せず、カスタム実装（CSS relative/absolute ポジショニング）を採用した。

実装箇所:
- `app/(authenticated)/_components/ClientForm.tsx:201-284`（支払額）
- `app/(authenticated)/_components/ClientForm.tsx:368-405`（割勘金額）
- `app/(authenticated)/purchase/[id]/edit/PurchaseEditForm.tsx:159-242`（支払額）
- `app/(authenticated)/purchase/[id]/edit/PurchaseEditForm.tsx:326-365`（割勘金額）

## 理由

shadcn/ui Input Groupコンポーネントを試験的に導入したところ、React Hook FormのFormControlコンポーネント（Radix UI Slotベース）との互換性問題が発生した。

### 問題の詳細

FormControlはSlotパターンを使用して、子要素に`id`、`aria-describedby`、`aria-invalid`などのアクセシビリティ属性を自動的に付与する。Input Groupを使用すると、これらの属性がInput Group自体に付与され、実際の`<input>`要素に到達しなかった。

```tsx
// 問題のあるパターン
<FormControl>
  <InputGroup>
    <InputGroupInput {...field} />  {/* id等が付与されない */}
    <InputGroupAddon>
      <Button>×</Button>
    </InputGroupAddon>
  </InputGroup>
</FormControl>
```

### 採用した解決策

既存のInput/FormControl構造を維持し、CSSポジショニングでクリアボタンを配置した。

```tsx
// 採用したパターン
<div className="relative">
  <FormControl>
    <Input {...field} className={field.value !== 0 ? "pr-8" : ""} />
  </FormControl>
  {field.value !== 0 && (
    <Button className="absolute right-1 top-1/2 -translate-y-1/2">
      <X />
    </Button>
  )}
</div>
```

## 結果

### 良い影響

- FormControlのアクセシビリティ機能が正常に動作する
- 既存のフォームロジックへの影響がない
- シンプルで理解しやすい実装
- テストが既存パターンで書ける

### 悪い影響・トレードオフ

- shadcn/ui Input Groupコンポーネントは追加されたが未使用（将来の参考用）
- クリアボタンの配置ロジックが複数箇所で重複している

### 技術的負債

Input Groupコンポーネント（`components/ui/input-group.tsx`）は現在未使用だが、将来FormControl外で使用する可能性があるため残している。不要であれば削除可能。

## 代替案

### 1. shadcn/ui Input Groupをそのまま使用

- 却下理由: FormControlとの互換性問題でアクセシビリティ属性が正しく付与されない

### 2. FormControlを使わずInput Groupを使用

- 却下理由: React Hook Formとの統合が崩れ、バリデーションエラー表示などに影響

### 3. カスタムFormControlを作成

- 却下理由: 過度な複雑化。現行のシンプルな解決策で十分

## 関連する決定

- 0003: ボタン内ローディング表示の標準化（Loader2アイコン使用）
  - クリアボタンもButton variant="ghost"を使用し、UIの一貫性を維持
