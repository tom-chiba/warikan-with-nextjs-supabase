# Architecture Decision Records (ADR)

このディレクトリには、プロジェクトの重要なアーキテクチャ決定を記録したADR（Architecture Decision Records）を保存しています。

## ADRとは

ADRは、ソフトウェアアーキテクチャに関する重要な決定とその背景を記録するドキュメントです。

### 目的

- 設計判断の理由と背景を明確にする
- 将来の開発者（未来の自分を含む）が決定の経緯を理解できるようにする
- 同じ議論を繰り返さないようにする
- 技術的負債や制約を明示する

## ADRの命名規則

```
XXXX-short-descriptive-title.md
```

- `XXXX`: 4桁の連番（0001, 0002, ...）
- `short-descriptive-title`: 決定内容を表す簡潔なタイトル（ケバブケース）

## ADRを作成するタイミング

以下のような場合にADRを作成します：

- 技術スタック・ライブラリの選定
- アーキテクチャパターンの採用
- データモデルの重要な設計判断
- パフォーマンスと可読性などのトレードオフ
- 既知の制約や技術的負債の記録
- 代替案を検討した上での選択

## ADR一覧

| 番号 | タイトル | ステータス | 日付 |
|------|----------|------------|------|
| [0001](./0001-record-architecture-decisions.md) | アーキテクチャ決定記録を残す | Accepted | 2025-10-04 |

## TDDワークフローでの使用

TDDサイクルの最終フェーズで、重要な設計判断があった場合にADRを作成します：

```bash
/tdd-investigate [機能]
/tdd-plan [機能]
/tdd-implement [機能]
/tdd-verify [機能]
/tdd-document [機能]  # ← このフェーズでADRを作成
```

## 参考資料

- [ADR GitHub](https://adr.github.io/)
- [Documenting Architecture Decisions by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
