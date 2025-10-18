# 0004. App Router標準機能を活用した統一的なエラーハンドリング

日付: 2025-10-05

## ステータス

Accepted

## コンテキスト

プロジェクト全体でエラー処理が一貫していない状態だった：

- 5種類の異なるエラー表示パターンが混在
- `ErrorMessage`コンポーネントは定義されているが、ほとんど使用されていない
- Supabaseの詳細なエラー情報（code、details、hint）が失われている
- TanStack Queryの`onError`コールバックが全く使用されていない
- `throwOnError: true`を使用しているが、親コンポーネントでキャッチされていない

この状態では、ユーザーへのエラー通知が不十分で、開発者もエラーのデバッグが困難だった。

## 決定

Next.js 15のApp Router標準機能を最大限活用し、以下の3層エラーハンドリング戦略を採用した：

### Layer 1: Expected Errors（予期可能なエラー）

- TanStack Queryの`onError`コールバックでトースト通知
- `throwOnError`は使用しない
- UIの継続性を維持（エラー時もテーブル表示を保持）

### Layer 2: Error Boundary（予期しない例外）

- `app/(authenticated)/error.tsx`でServer Componentエラーをキャッチ
- `app/not-found.tsx`で404エラー専用UI
- `app/global-error.tsx`で最終的なフォールバック

### Layer 3: ErrorMessageコンポーネント（部分的エラー）

- アクセシビリティ対応（`role="alert"`, `aria-live="assertive"`）
- 再試行ボタン（オプショナル）
- タイトル、メッセージ、アイコン表示

実装ファイル：
- `app/(authenticated)/error.tsx`
- `app/not-found.tsx`
- `components/ErrorMessage.tsx`
- 全12箇所のMutationに`onError`追加

## 理由

### 1. App Router標準機能の優位性

- Next.js 15の推奨パターンに従う
- 独自のエラー型定義やヘルパー関数が不要
- フレームワークのアップデートに追従しやすい

### 2. Expected ErrorsとUncaught Exceptionsの分離

Next.js公式ドキュメントの推奨に従い：
- **Expected Errors**: ユーザーが修正可能 → `onError`でトースト通知
- **Uncaught Exceptions**: 重大なバグ → Error Boundaryで処理

### 3. ユーザー体験の向上

- エラー時もUIを保持することで、ユーザーが操作を継続できる
- トースト通知により、エラーを見逃さない
- 再試行ボタンで即座にリカバリー可能

### 4. 開発者体験の向上

- 統一的なパターンにより、新しいコードの追加が容易
- エラーハンドリングの実装箇所が明確
- テストが書きやすい

## 結果

### 良い影響

- **統一的なUX**: 全てのエラーがトーストで通知され、一貫した体験
- **UIの継続性**: エラー時もテーブルやフォームが表示され、操作を継続可能
- **アクセシビリティ**: `role="alert"`と`aria-live`で支援技術に対応
- **保守性向上**: エラーハンドリングパターンが明確で、新規追加が容易
- **テストカバレッジ**: ErrorMessageコンポーネントに14テスト、全65テスト合格

### 悪い影響・トレードオフ

- **Supabaseエラー詳細の損失**: PostgrestErrorの`code`, `details`, `hint`を活用していない
  - 現状は`error.message`のみを使用
  - 将来的に詳細なエラー情報が必要になった場合、構造化エラー型の導入が必要
- **Server Actionsへの未移行**: Next.js 15推奨のServer Actionsを使用していない
  - 現状はClient Component内のMutationを使用
  - 長期的にはServer Actionsへの移行が望ましい

## 代替案

### 1. 独自のエラー型定義とヘルパー関数

**検討内容**:
```typescript
type AppError = {
  type: 'database' | 'validation' | 'auth' | 'network' | 'unknown';
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

function createAppError(error: PostgrestError | Error): AppError;
```

**不採用理由**:
- App Routerの標準機能で十分対応可能
- 独自実装はメンテナンスコストが高い
- フレームワークのアップデートに追従しにくい

### 2. throwOnErrorの継続使用

**不採用理由**:
- Expected ErrorsもError Boundaryに伝播してしまう
- UIが完全に破棄され、ユーザー体験が悪化
- Next.js 15の推奨パターンから外れる

### 3. 全てのエラーをError Boundaryで処理

**不採用理由**:
- Expected Errorsまでページ全体のエラー画面になってしまう
- ユーザーが修正可能なエラーで操作を中断させるのは不適切
- きめ細かいエラーハンドリングができない

## 関連する決定

- **0002. Loaderとinert制御の分離**: LoaderWithInertをMutation実行中に使用
- **0003. ボタン内ローディング表示のLoader2統一**: エラー時のローディング表示と統一感

## 今後の改善案

1. **Supabaseエラー詳細の活用**: 必要に応じて構造化エラー型を導入
2. **Server Actionsへの移行**: フォーム送信をServer Actionsに段階的に移行
3. **Error Boundaryのネスト**: ページごとにより詳細なエラーUIを提供
4. **エラーログ収集**: 本番環境でのエラーをSentryなどで収集
