---
description: TDD検証フェーズ - 実装の品質と完成度を確認する
argument-hint: [実装した機能]
---

# TDD 検証フェーズ

**目的**: $ARGUMENTS

## タスク

実装フェーズで作成したコードの品質と完成度を検証してください：

### 1. テストカバレッジの確認

- すべての要件がテストでカバーされているか確認する
- 正常系・異常系・エッジケースがテストされているか確認する
- テストコードの可読性と保守性を確認する

### 2. コード品質チェック

```bash
# 型チェック
npm run tsc

# リント・フォーマットチェック
npm run biome:check

# すべてのチェックを実行
npm run check
```

### 3. テスト実行

```bash
# コンポーネントテストを実行
npm run test:comp

# E2Eテストを実行（必要に応じて）
npm run test:e2e
```

### 4. コードレビュー観点

- **テストコード**
  - テスト名が振る舞いを明確に表現しているか
  - テストが独立しており順序に依存していないか
  - AAA（Arrange-Act-Assert）パターンに従っているか
  - モックが適切に使用されているか

- **実装コード**
  - 単一責任原則に従っているか
  - 既存のコーディング規約に従っているか
  - 適切な型定義がされているか
  - エラーハンドリングが適切か

- **設計**
  - コンポーネントの責務分離が適切か
  - 再利用性が考慮されているか
  - パフォーマンスへの影響は許容範囲か

### 5. 動作確認

#### 開発サーバーでの確認

```bash
# 開発サーバーで実際の動作を確認
npm run dev
```

#### MCPツールでの自動確認

**Playwright MCP** を使用して自動でブラウザ操作・確認を実行できます：

```bash
# ブラウザで自動操作・確認
mcp__playwright__browser_navigate(url="http://localhost:3000")
mcp__playwright__browser_snapshot()  # ページ内容確認
mcp__playwright__browser_click(...)  # UI操作テスト
```

**Chrome DevTools MCP** を使用してパフォーマンスやコンソールエラーを確認できます：

```bash
# コンソールエラーチェック
mcp__chrome-devtools__list_console_messages()

# パフォーマンストレース
mcp__chrome-devtools__performance_start_trace(reload=true, autoStop=true)
```

#### 確認項目

- ブラウザで実際の動作を確認する
- 既存機能に影響がないか確認する（リグレッションテスト）
- UI/UXが期待通りか確認する
- コンソールエラーがないか確認する

### 6. ドキュメント更新

必要に応じて以下を更新する：

- コードコメント（複雑なロジックの説明）
- 型定義のJSDoc
- プロジェクトドキュメント（CLAUDE.md等）

### 7. コミット準備

検証が完了したら：

```bash
# ステージングして状態確認
git add .
git status

# コミット（Claude Codeに依頼可能）
# 例: "購入品削除機能を実装（TDD）"
```

#### GitHub連携（オプション）

**GitHub MCP** を使用してIssueやPRを作成できます：

```bash
# Issue作成
mcp__github__create_issue(
  owner="username",
  repo="warikan-with-nextjs-supabase",
  title="実装した機能のタイトル",
  body="実装内容の詳細"
)

# PR作成（別ブランチで作業している場合）
mcp__github__create_pull_request(
  owner="username",
  repo="warikan-with-nextjs-supabase",
  title="feat: 実装した機能",
  head="feature-branch",
  base="main",
  body="## 変更内容\n- ..."
)
```

## チェックリスト

- [ ] すべてのテストが通る
- [ ] 型チェックが通る
- [ ] リント・フォーマットチェックが通る
- [ ] 要件がすべて実装されている
- [ ] コードレビュー観点をクリアしている
- [ ] ブラウザでの動作確認が完了している
- [ ] 必要なドキュメントが更新されている

**次のフェーズ**: すべての検証項目をクリアしたら、`/tdd-document` でドキュメント作成フェーズに進んでください。
