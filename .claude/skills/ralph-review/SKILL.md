---
name: ralph-review
description: Performs iterative code review with automated verify-fix cycles. Triggers when the user asks to "iteratively review code", "review and fix", "ralph review", "ralph-review", "レビューして修正", "反復レビュー", or wants an automated review-verify-fix cycle on a PR, branch, file, or directory.
---

# Ralph Review - 反復レビュー＆修正サイクル

レビュー対象に対して、包括的レビュー → 妥当性検証 → 修正 → 再レビューのサイクルを、問題がなくなるか最大5回まで繰り返す。ralph-loop プラグインを利用して自動的にイテレーションを行う。

## 起動方法

/ralph-loop:ralph-loop を以下の形式で呼び出す:

/ralph-loop:ralph-loop "レビュープロンプト" --max-iterations 5 --completion-promise NO_ISSUES_REMAINING

レビュープロンプトには、以下のテンプレートの {{TARGET}} をユーザーの引数で置換したものを指定する。

## レビュープロンプトテンプレート

{{TARGET}} をユーザー指定の引数（PR番号、ファイルパス、ブランチ名など）で置換して使用する。

重要: テンプレート内にバッククォートを含めないこと。ralph-loop スキルにプロンプトを渡す際、バッククォートがシェルのコマンド置換として解釈されエラーになるため。

---

以下の対象に対して、レビュー→検証→修正サイクルの1イテレーションを実行せよ: {{TARGET}}

【ステップ1: レビュー対象の特定】

引数の内容に応じてレビュー対象を決定する:

- PR番号またはURL: gh pr diff コマンドで変更ファイルと差分を取得
- ファイルパスやglob: 指定されたファイルを読み取る
- ブランチ名: git diff main...{{TARGET}} コマンドで変更内容を取得
- 不明な場合: 引数を最善の判断で解釈する

【ステップ2: 包括的レビュー】

コード品質（バグ、セキュリティ、パフォーマンス、エラーハンドリング）と設計（アーキテクチャ整合性、関心の分離、プロジェクト規約との一貫性）の両面でレビューする。CLAUDE.md と既存コードを参照してプロジェクト固有の規約を確認すること。

各指摘を番号付きリストで、カテゴリ・重要度・ファイルと箇所・説明・修正案を含めて出力する。

【ステップ3: 各指摘の妥当性検証】

各指摘について Explore エージェントを起動し、問題が実際に存在するか・他の箇所で既に対処されていないかを検証する。各指摘を 妥当 または 却下 としてマークする。

【ステップ4: 修正の適用】

妥当 とマークされた各指摘について修正を適用する。すべての修正後に npm run check を実行。コンポーネントに影響する変更の場合は npm run test:comp も実行する。

【ステップ5: 完了判定】

- 修正が行われた場合 → 完了プロミスを出力しない（次のイテレーションへ）
- 修正なし（全指摘が却下 or 指摘なし）→ 完了プロミス NO_ISSUES_REMAINING を出力

イテレーションのサマリーを報告する:

```
イテレーション進捗:
- [ ] レビューした指摘の数
- [ ] 妥当と判断し修正した数
- [ ] 却下した数（簡潔な理由付き）
- [ ] ループの継続/終了の判断
```

---

## 使用例

```
# PRをレビュー
/ralph-review #42

# 特定のファイルをレビュー
/ralph-review src/components/EventForm.tsx src/hooks/useEvent.ts

# 現在のブランチの変更をレビュー
/ralph-review fix/empty-initial-amount-fields

# ディレクトリをレビュー
/ralph-review src/features/settlement/
```

## 重要事項

- 無限ループ防止のため最大イテレーション回数は5回
- 各イテレーションでは前回の修正を含む全体を再レビューする
- 完了プロミス NO_ISSUES_REMAINING は本当にアクション可能な問題がない場合のみ出力する
