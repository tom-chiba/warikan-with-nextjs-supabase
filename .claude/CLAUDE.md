# CLAUDE.md

## プロジェクト概要

割り勘管理アプリケーション（warikan）- Next.js App Router + Supabase構成

## 開発方針

- TDDで進める。Red-Green-Refactorサイクルを守ること。
- 重要な設計判断は ADR として `docs/adr/` に記録する。
- ブランチ戦略は GitHub Flow を採用。mainブランチから機能ブランチを切り、PRを経由してマージする。
