# 0007. Biome 2.x へのマイグレーション

日付: 2025-11-29

## ステータス

Accepted

## コンテキスト

Biome を 1.6.1 から 2.3.3 にメジャーバージョンアップした際、設定ファイル `biome.json` のスキーマが大幅に変更され、`npm run biome:format` および `npm run biome:check` がエラーで失敗するようになった。

### 主なエラー

1. **スキーマバージョン不一致**: `$schema` が 1.6.1 のままで CLI バージョン 2.3.3 と一致しない
2. **`organizeImports` キーの廃止**: 2.x では `assist.actions.source.organizeImports` に移動
3. **`files.ignore` / `files.include` キーの廃止**: 2.x では `files.includes` に統合、除外パターンは `!` プレフィックス
4. **Tailwind CSS ディレクティブのパースエラー**: `@tailwind` や `@apply` が未知の構文としてエラー
5. **新しいリントルール**: 不要なフラグメント、未使用パラメータ、セマンティック要素などの新ルールが追加

## 決定

以下の方針で Biome 2.x へのマイグレーションを実施する。

### 1. 公式マイグレーションツールの使用

```bash
npx biome migrate --write
```

これにより、基本的な設定の移行が自動で行われる。

### 2. Tailwind CSS サポートの有効化

```json
"css": {
  "parser": {
    "cssModules": true,
    "tailwindDirectives": true
  },
  "linter": {
    "enabled": false
  }
}
```

- `tailwindDirectives: true` で `@tailwind` / `@apply` ディレクティブをサポート
- CSS リンターは無効化（Tailwind の独自構文との競合を回避）

### 3. 特定ルールの調整

```json
"a11y": {
  "useSemanticElements": "off"
}
```

ローディングスピナーでの `role="status"` 使用を許可するため、`useSemanticElements` ルールを無効化。

### 4. コードの修正

新しいリントルールに対応するため、以下のコードを修正：

- 不要なフラグメント `<>...</>` の削除
- 未使用パラメータの削除
- `role="status"` のアクセシビリティ対応

## 理由

1. **公式ツールの信頼性**: `biome migrate` は Biome チームが提供する公式マイグレーションツールであり、設定の互換性が保証される
2. **Tailwind CSS との共存**: このプロジェクトは Tailwind CSS を使用しており、CSS パーサーでの Tailwind サポートが必須
3. **コード品質の向上**: 新しいリントルールにより、不要なコードや潜在的な問題が検出・修正される

## 結果

### 良い影響

- 最新の Biome 機能とパフォーマンス改善が利用可能
- より厳格なリントルールによるコード品質の向上
- Tailwind CSS との適切な統合

### 悪い影響・トレードオフ

- 一部のルール（`useSemanticElements`）を無効化する必要がある
- CSS リンターを無効化したため、CSS の静的解析が弱くなる

## 修正されたファイル

### 設定ファイル

- `biome.json`: Biome 2.x 形式に更新

### ソースコード

- `app/(authenticated)/member/_components/ClientPurchasersTable.tsx`: 不要なフラグメント削除
- `app/(authenticated)/unsettled/_components/ClientUnsettledTable.tsx`: 不要なフラグメント削除
- `app/(authenticated)/settled/_components/ClientSettledTable.tsx`: 未使用パラメータ削除
- `app/(authenticated)/settled/_components/ServerSettledTable.tsx`: 未使用データフェッチ削除
- `app/(authenticated)/settled/_components/ClientSettledTable.comp.test.tsx`: テスト更新
- `components/Loader.tsx`: `role="status"` 追加
- `app/globals.css`: フォーマット適用

## 代替案

1. **Biome のバージョンを固定**: 1.6.1 のまま使用し続ける
   - 却下理由: セキュリティアップデートや新機能が利用できない
2. **手動で設定を書き換える**: マイグレーションツールを使わずに手動で修正
   - 却下理由: 工数がかかり、ミスのリスクがある

## 参考

- [Biome v2 Migration Guide](https://biomejs.dev/guides/migrate-biome-v2/)
- [Biome CSS Parser Options](https://biomejs.dev/reference/configuration/#cssparser)
