# 0009. 全画面ローディングをLoader2アイコンに統一

日付: 2025-11-29

## ステータス

Accepted

## コンテキスト

全画面ローディング表示を担う`Loader`コンポーネントは、CSSモジュール（`Loader.module.css`）を使用したカスタムスピナーを実装していた。

```tsx
// 変更前: CSSモジュールによるカスタムスピナー
import styles from "./Loader.module.css";

<div className={`${styles.loader} w-12 p-2 aspect-square rounded-full bg-green-700`} />
```

この実装には以下の問題があった：

1. **TypeScriptの型エラー**: CSSモジュールの型宣言（`*.module.css`）が存在せず、CIで`TS2307: Cannot find module './Loader.module.css'`エラーが発生
2. **ボタン内ローディングとの不統一**: ADR 0003で`Loader2`アイコンに統一したが、全画面ローディングは別実装のまま
3. **追加ファイルの管理**: CSSモジュールファイルと型宣言ファイルの管理が必要

## 決定

全画面ローディング表示を**lucide-reactの`Loader2`アイコン**で実装する。

```tsx
// 変更後: Loader2アイコンによる統一実装
import { Loader2 } from "lucide-react";

<Loader2 className="h-12 w-12 animate-spin text-primary" />
```

## 理由

### 1. プロジェクト全体でのローディング表示の統一

- ボタン内ローディング: `Loader2`（ADR 0003で決定済み）
- 全画面ローディング: `Loader2`（今回の決定）
- 一貫したデザイン言語により、ユーザー体験が向上

### 2. 型エラーの解消

- CSSモジュールの型宣言ファイルが不要に
- TypeScriptの標準サポート内で完結

### 3. 依存関係の簡素化

- CSSモジュールファイル（`Loader.module.css`）を削除
- lucide-reactは既存の依存関係として存在

### 4. ダークモード対応の改善

- `text-primary`クラスでテーマに応じた色が自動適用
- 背景色も`bg-white/50 dark:bg-black/50`で対応

## 結果

### 良い影響

- ✅ CIの型エラーが解消
- ✅ ローディング表示がプロジェクト全体で統一
- ✅ CSSモジュールファイルと型宣言ファイルが不要に
- ✅ ダークモード対応が改善
- ✅ 保守するファイル数が減少

### 悪い影響・トレードオフ

- ⚠️ カスタムスピナーのデザインが変更された
  - 対策: `Loader2`はlucide-reactの標準アイコンで視認性は十分
- ⚠️ 以前の緑色のスピナーから変更
  - 対策: `text-primary`でプロジェクトのプライマリカラーを使用

## 代替案

### 1. CSSモジュールの型宣言ファイルを追加

```typescript
// css-modules.d.ts
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

**採用しなかった理由**:
- ボタン内ローディングとの不統一が解消されない
- 追加ファイルの管理が必要
- プロジェクト内で他にCSSモジュールを使用していない

### 2. Tailwind CSSのカスタムアニメーションに移行

```javascript
// tailwind.config.js
animation: {
  'custom-spin': '...'
}
```

**採用しなかった理由**:
- 設定の追加が必要
- `Loader2`で十分に代替可能
- ボタン内ローディングとの統一にならない

## 関連する決定

- **0002. Loaderコンポーネントの責務分離とServer Component対応**
  - `Loader`と`LoaderWithInert`の責務分離
- **0003. ボタン内ローディング表示をLoader2アイコンで統一**
  - ボタン内ローディングの`Loader2`統一を決定

## 実装詳細

### 変更ファイル

- `components/Loader.tsx`: CSSモジュールから`Loader2`に変更

### 削除ファイル

- `components/Loader.module.css`: 不要になったCSSモジュール
