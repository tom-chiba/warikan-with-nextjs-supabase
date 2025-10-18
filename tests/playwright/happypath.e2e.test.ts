import { expect, test } from "@playwright/test";

test.describe("ハッピーパス", () => {
	test("ログインから精算、データ削除までの一連の操作が正常に完了すること", async ({
		page,
	}) => {
		// 0. テストデータのクリーンアップ（前回失敗時の残骸を削除）
		await test.step("クリーンアップ", async () => {
			await page.goto("/member");

			// 入力モードをキャンセル
			const cancelButton = page.locator("button:has(svg.lucide-x)");
			const cancelCount = await cancelButton.count();
			if (cancelCount > 0) {
				await cancelButton.first().click();
				await page.waitForTimeout(200);
			}

			// 全ての既存メンバーを削除
			let deleteButtons = page.locator("button:has(svg.lucide-trash)");
			let deleteCount = await deleteButtons.count();

			while (deleteCount > 0) {
				await deleteButtons.first().click();
				await page.waitForTimeout(500);

				deleteButtons = page.locator("button:has(svg.lucide-trash)");
				const newCount = await deleteButtons.count();

				if (newCount >= deleteCount) break;

				deleteCount = newCount;
			}

			// テスト購入品を削除
			await page.goto("/unsettled");
			const testPurchaseUnsettled = page.getByRole("row", {
				name: /テスト購入品/,
			});
			const unsettledCount = await testPurchaseUnsettled.count();
			if (unsettledCount > 0) {
				await testPurchaseUnsettled
					.locator("button:has(svg.lucide-ellipsis)")
					.first()
					.click();
				await page.getByRole("menuitem", { name: "削除" }).click();
				await expect(testPurchaseUnsettled).not.toBeVisible({ timeout: 5000 });
			}

			await page.goto("/settled");
			const testPurchaseSettled = page.getByRole("row", {
				name: /テスト購入品/,
			});
			const settledCount = await testPurchaseSettled.count();
			if (settledCount > 0) {
				await testPurchaseSettled
					.locator("button:has(svg.lucide-ellipsis)")
					.first()
					.click();
				await page.getByRole("menuitem", { name: "削除" }).click();
				await expect(testPurchaseSettled).not.toBeVisible({ timeout: 5000 });
			}
		});

		// 1. メンバーを2人追加する
		await test.step("メンバー追加", async () => {
			await page.goto("/member");

			// メンバー1を追加
			await page.getByRole("button", { name: "追加" }).click();
			await page.getByRole("textbox").last().fill("メンバー1");
			await page.locator("button:has(svg.lucide-check)").click();

			// テーブルに "メンバー1" が表示されるのを待つ
			await expect(page.getByRole("cell", { name: "メンバー1" })).toBeVisible();

			// メンバー2を追加
			await page.getByRole("button", { name: "追加" }).click();
			await page.getByRole("textbox").last().fill("メンバー2");
			await page.locator("button:has(svg.lucide-check)").click();

			// テーブルにメンバーが表示されることを確認
			await expect(page.getByRole("cell", { name: "メンバー1" })).toBeVisible();
			await expect(page.getByRole("cell", { name: "メンバー2" })).toBeVisible();
		});

		// 2. 購入品を追加する
		await test.step("購入品追加", async () => {
			await page.goto("/");
			await page.getByLabel("購入品名").fill("テスト購入品");

			// 支払額の入力 (メンバー1が1000円支払う)
			const paymentCard = page.locator("div.bg-card", {
				has: page.getByRole("heading", { name: "支払額", level: 3 }),
			});
			await paymentCard
				.locator("li", { hasText: "メンバー1" })
				.getByRole("textbox")
				.fill("1000");

			// 割勘金額が自動で等分されることを確認
			const splitCard = page.locator("div.bg-card", {
				has: page.getByRole("heading", { name: "割勘金額", level: 3 }),
			});
			await expect(
				splitCard.locator("li", { hasText: "メンバー1" }).getByRole("textbox"),
			).toHaveValue("500");
			await expect(
				splitCard.locator("li", { hasText: "メンバー2" }).getByRole("textbox"),
			).toHaveValue("500");

			// 登録ボタンをクリック
			await page.locator("form").getByRole("button", { name: "追加" }).click();

			// 成功通知が表示されることを確認
			await expect(page.getByText("購入品を追加しました")).toBeVisible();
		});

		// 3. 精算する
		await test.step("精算", async () => {
			await page.goto("/unsettled");

			// 未精算項目が表示されていることを確認
			const unsettledRow = page.getByRole("row", { name: /テスト購入品/ });
			await expect(unsettledRow).toBeVisible();
			await expect(unsettledRow).toContainText("1000"); // 合計金額

			// 精算処理
			await unsettledRow.locator("button:has(svg.lucide-ellipsis)").click();
			await page.getByRole("menuitem", { name: "精算" }).click();

			// 精算済みになり、項目がリストから消えることを確認
			await expect(unsettledRow).not.toBeVisible();
		});

		// 4. 精算済み購入品を削除する
		await test.step("精算済み購入品削除", async () => {
			await page.goto("/settled");

			// 精算済み項目が表示されていることを確認
			const settledRow = page.getByRole("row", { name: /テスト購入品/ });
			await expect(settledRow).toBeVisible();

			// 削除処理
			await settledRow.locator("button:has(svg.lucide-ellipsis)").click();
			await page.getByRole("menuitem", { name: "削除" }).click();

			// 項目がリストから消えることを確認
			await expect(settledRow).not.toBeVisible();
		});

		// 5. メンバーを削除する
		await test.step("メンバー削除", async () => {
			await page.goto("/member");

			// メンバー1を削除
			const member1Row = page.getByRole("row", { name: /メンバー1/ });
			await member1Row.locator("button:has(svg.lucide-trash)").click();

			// メンバー2を削除
			const member2Row = page.getByRole("row", { name: /メンバー2/ });
			await member2Row.locator("button:has(svg.lucide-trash)").click();

			// 項目がリストから消えることを確認
			await expect(
				page.getByRole("cell", { name: "メンバー1" }),
			).not.toBeVisible();
			await expect(
				page.getByRole("cell", { name: "メンバー2" }),
			).not.toBeVisible();
		});
	});
});
