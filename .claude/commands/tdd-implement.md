---
description: TDD実装フェーズ - Red-Green-Refactorサイクルを実行する
argument-hint: [実装する機能]
---

# TDD 実装フェーズ (Red-Green-Refactor)

**目的**: $ARGUMENTS

## Red-Green-Refactorサイクル

計画フェーズで作成したタスクリストに従って、以下のサイクルを繰り返してください：

### 🔴 Red - 失敗するテストを書く

1. **最小単位のテストケースを1つ選ぶ**
   - 最もシンプルなケースから開始する
   - 1つのサイクルで1つの振る舞いのみをテストする

2. **失敗するテストを書く**
   - テストファイル（`*.comp.test.tsx` または `*.test.ts`）を作成/編集する
   - 期待される振る舞いを明確にテストコードで表現する
   - 実装がまだないため、テストは必ず失敗する

3. **テストを実行して失敗を確認する**
   - `npm run test:comp` でテストを実行する
   - 意図した理由で失敗していることを確認する
   - エラーメッセージが適切か確認する

### 🟢 Green - テストを通す最小限の実装

4. **テストを通すための最小限のコードを書く**
   - テストが通ることだけを目的とする
   - 設計の美しさやパフォーマンスは後回し
   - ハードコードや重複コードも許容する

5. **テストを実行して成功を確認する**
   - `npm run test:comp` でテストが通ることを確認する
   - すべての既存テストも通ることを確認する（リグレッション防止）

### ♻️ Refactor - リファクタリング

6. **コードの改善**
   - 重複を排除する（DRY原則）
   - 変数名・関数名を意図が伝わるように改善する
   - コードの構造を整理する
   - 設計パターンを適用する

7. **テストを実行して Green を維持**
   - リファクタリング後もテストが通ることを確認する
   - テストコード自体もリファクタリング対象とする

8. **次のサイクルへ**
   - Todoリストの現在のタスクを完了にする
   - 次のテストケースに進む
   - すべてのテストケースが完了するまで繰り返す

## 重要な原則

- **ベイビーステップ**: 一度に小さな変更のみを行う
- **テストファースト**: 必ず実装コードより先にテストを書く
- **最小限の実装**: テストを通すための最小限のコードのみを書く
- **頻繁なコミット**: 各Greenのタイミングでコミットを検討する
- **リズム重視**: Red→Green→Refactorのリズムを保つ（5〜15分/サイクル）

## テスト実行コマンド

```bash
# コンポーネントテスト（watchモード）
npm run test:comp:watch

# コンポーネントテスト（1回実行）
npm run test:comp

# E2Eテスト
npm run test:e2e
```

## E2Eテストの実装

重要な機能やユーザーフローについては、E2Eテストも実装してください：

### Playwright E2Eテスト作成

**frontend-test-implementer** サブエージェントでE2Eテストを実装：

```bash
Task(subagent_type="frontend-test-implementer",
     prompt="購入品削除機能のE2Eテスト（tests/playwright/*.e2e.test.ts）を実装してください")
```

### Playwright MCPでの手動確認

実装したE2Eテストの動作を **Playwright MCP** で確認：

```bash
# ブラウザ起動・操作
mcp__playwright__browser_navigate(url="http://localhost:3000/unsettled")
mcp__playwright__browser_snapshot()
mcp__playwright__browser_click(element="削除ボタン", ref="...")
```

## サブエージェントの活用

TDD実装フェーズでは、以下のサブエージェントを活用してください：

### 🧪 テスト実装 (Red フェーズ)

**frontend-test-implementer** エージェントを使用：
- 失敗するテストケースの作成
- MSWハンドラーの実装
- テストデータ・モックの準備
- テストファイル（`*.comp.test.tsx`）の作成

### 💻 プロダクションコード実装 (Green フェーズ)

**frontend-implementer** エージェントを使用：
- コンポーネントの実装
- カスタムフックの実装
- ユーティリティ関数の実装
- 型定義の作成

### ✅ テスト実行 (各フェーズ)

**frontend-test-runner** エージェントを使用：
- テストの実行と結果確認
- 失敗の原因分析
- テストカバレッジの確認

## サブエージェント実行例

```bash
# Redフェーズ: テスト実装
Task(subagent_type="frontend-test-implementer",
     prompt="ClientControlMenuコンポーネントの削除機能テストを実装してください")

# Greenフェーズ: 実装
Task(subagent_type="frontend-implementer",
     prompt="ClientControlMenuの削除機能を実装してください")

# テスト実行
Task(subagent_type="frontend-test-runner",
     prompt="ClientControlMenuのテストを実行してください")
```

**次のフェーズ**: 実装完了後は `/tdd-verify` で検証フェーズに進んでください。
