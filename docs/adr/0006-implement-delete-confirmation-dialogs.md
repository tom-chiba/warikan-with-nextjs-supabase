# 6. 削除操作に確認ダイアログを実装

日付: 2025-10-19

## ステータス

採用

## コンテキスト

アプリケーション内の削除操作（メンバー削除、購入品削除）において、ユーザーの誤操作による意図しないデータ削除を防ぐ必要がある。削除操作は取り消しができないため、実行前に確認ダイアログを表示し、ユーザーに明示的な確認を求める仕組みが必要となった。

### 要件

1. すべての削除機能に確認ダイアログを追加
2. 削除対象の名前を表示（例: "「メンバー1」を削除しますか？"）
3. `variant="destructive"`（赤色の警告色）を使用
4. 削除中はその他の操作を全てブロック

### 対象箇所

- メンバー削除: `app/(authenticated)/member/_components/ClientPurchasersTable.tsx`
- 未精算購入品削除: `app/(authenticated)/unsettled/_components/ClientControlMenu.tsx`
- 精算済み購入品削除: `app/(authenticated)/settled/_components/ClientControlMenu.tsx`

## 決定

### 1. AlertDialogコンポーネントの採用

shadcn/uiの`AlertDialog`コンポーネントを使用して確認ダイアログを実装する。

**理由:**
- プロジェクトで既に採用しているshadcn/uiとの一貫性
- Radix UIベースでアクセシビリティが担保されている
- `role="alertdialog"`による適切なARIA属性
- ESCキーやオーバーレイクリックでの閉じる動作が標準実装済み

**コード例:**
```tsx
<AlertDialog
  open={deleteTarget !== null}
  onOpenChange={(open) => {
    if (!open && !deletePurchaserMutation.isPending) {
      setDeleteTarget(null);
    }
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>メンバーを削除</AlertDialogTitle>
      <AlertDialogDescription>
        「{deleteTarget?.name}」を削除しますか？この操作は取り消せません。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={deletePurchaserMutation.isPending}>
        キャンセル
      </AlertDialogCancel>
      <Button
        variant="destructive"
        onClick={() =>
          deleteTarget && deletePurchaserMutation.mutate(deleteTarget.id)
        }
        disabled={deletePurchaserMutation.isPending}
      >
        {deletePurchaserMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "削除"
        )}
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 2. 状態管理パターン

削除対象を保持する`deleteTarget`ステートを使用し、ダイアログの表示/非表示を制御する。

**理由:**
- 削除対象の情報（IDと名前）をダイアログに渡す必要がある
- `null`チェックでダイアログの開閉状態を管理できる
- Mutation成功時に`setDeleteTarget(null)`でダイアログを自動的に閉じられる

**実装パターン:**
```tsx
const [deleteTarget, setDeleteTarget] = useState<{
  id: number;
  name: string;
} | null>(null);

const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
    // 削除処理
  },
  onSuccess: () => {
    setDeleteTarget(null); // ダイアログを閉じる
    queryClient.invalidateQueries({ queryKey: ["key"] });
  },
});
```

### 3. ButtonコンポーネントをAlertDialogActionの代わりに使用

削除ボタンに`AlertDialogAction`ではなく、通常の`Button`コンポーネント（`variant="destructive"`）を使用する。

**理由:**
- `AlertDialogAction`はクリック時に自動的にダイアログを閉じるため、ローディング状態の表示ができない
- 非同期処理（Mutation）の完了を待たずにダイアログが閉じてしまう問題が発生
- 通常の`Button`を使用することで、Mutation実行中のローディング表示が可能

**コード比較:**

```tsx
// ❌ AlertDialogActionを使用した場合（問題あり）
<AlertDialogAction onClick={() => mutation.mutate(id)}>
  削除
</AlertDialogAction>
// → クリック直後にダイアログが閉じ、ローディング状態を表示できない

// ✅ Buttonを使用した場合（推奨）
<Button
  variant="destructive"
  onClick={() => mutation.mutate(id)}
  disabled={mutation.isPending}
>
  {mutation.isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    "削除"
  )}
</Button>
// → Mutation完了までダイアログが開いたまま、ローディング表示が可能
```

### 4. Mutation実行中のダイアログ閉じる操作をブロック

`onOpenChange`ハンドラーで、Mutation実行中（`isPending`が`true`）の場合はダイアログを閉じないようにする。

**理由:**
- ユーザーが削除ボタンを押した後、ESCキーやオーバーレイクリックでダイアログを閉じられないようにする
- 削除処理中の誤操作を防ぐ（要件4: 削除中はその他の操作を全てブロック）
- データの整合性を保つ（中途半端な状態でダイアログが閉じることを防ぐ）

**実装:**
```tsx
<AlertDialog
  open={deleteTarget !== null}
  onOpenChange={(open) => {
    // isPendingがtrueの場合は閉じる操作を無視
    if (!open && !deletePurchaserMutation.isPending) {
      setDeleteTarget(null);
    }
  }}
>
  {/* ... */}
</AlertDialog>

<AlertDialogCancel disabled={deletePurchaserMutation.isPending}>
  キャンセル
</AlertDialogCancel>
```

### 5. ローディング状態の表示

削除ボタン内に`Loader2`アイコン（`animate-spin`）を表示し、処理中であることを視覚的に示す。

**理由:**
- プロジェクトの既存パターン（`.claude/CLAUDE.md`のローディング表示ガイド）に準拠
- `lucide-react`の`Loader2`アイコンは他のアイコン（Edit, Trash等）と一貫性がある
- ボタンを`disabled`にすることで、重複クリックを防ぐ

参照: `app/(authenticated)/member/_components/ClientPurchasersTable.tsx:263-268`

## 結果

### ポジティブ

- **誤操作防止**: 削除前に確認を求めることで、意図しないデータ削除を防げる
- **ユーザビリティ向上**: 削除対象の名前を表示することで、ユーザーが何を削除しようとしているか明確になる
- **視覚的フィードバック**: ローディング状態を表示することで、処理中であることが明確になる
- **一貫性**: 3つの削除機能すべてで同じパターンを使用し、コードの一貫性が保たれる
- **アクセシビリティ**: Radix UIベースのAlertDialogにより、スクリーンリーダー対応が自動的に提供される

### ネガティブ

- **ステップ数の増加**: 削除に2クリック必要になり、操作ステップが1つ増える
- **コード量の増加**: 各削除機能に状態管理とダイアログコンポーネントが追加される
- **テストの複雑化**: ダイアログのインタラクションを含むテストが必要になる

### 対応するテスト

すべての削除機能に対して以下のテストケースを実装済み:

1. ダイアログ表示の確認
2. キャンセルボタンの動作確認
3. 削除確認後のAPI呼び出し確認
4. ローディング状態の表示確認

**テストファイル:**
- `app/(authenticated)/member/_components/ClientPurchasersTable.comp.test.tsx` (11テスト)
- `app/(authenticated)/unsettled/_components/ClientControlMenu.comp.test.tsx` (8テスト)
- `app/(authenticated)/settled/_components/ClientControlMenu.comp.test.tsx` (6テスト)
- `tests/playwright/happypath.e2e.test.ts` (E2Eテスト更新済み)

**テスト結果:** 全71テスト成功

## 代替案

### 代替案1: toast通知のみ

削除後にUndo機能付きのtoast通知を表示する方法。

**却下理由:**
- データベースから物理削除しているため、Undo実装が複雑
- 論理削除（deleted_atフラグ）への移行が必要
- 現時点では確認ダイアログの方がシンプルで実装コストが低い

### 代替案2: LoaderWithInertの使用

削除処理中に画面全体をブロックする`LoaderWithInert`コンポーネントを使用する方法。

**却下理由:**
- ダイアログ内でのローディング表示の方がユーザーにとって分かりやすい
- 画面全体をブロックする必要性が低い（ダイアログ自体がモーダルで他の操作を防いでいる）
- ボタン内のLoader2表示で要件4（操作ブロック）を満たせる

### 代替案3: カスタムConfirmコンポーネント

window.confirmの代わりにカスタムConfirmコンポーネントを作成する方法。

**却下理由:**
- shadcn/uiのAlertDialogで既に要件を満たせる
- 新規コンポーネントの作成・メンテナンスコストが不要
- Radix UIベースのアクセシビリティ実装を活用できる

## 参考資料

- [Radix UI AlertDialog Documentation](https://www.radix-ui.com/primitives/docs/components/alert-dialog)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)
- プロジェクト内のローディング表示ガイド: `.claude/CLAUDE.md` (ローディング表示の使い分けガイド)
