import { expect, test as setup } from "@playwright/test";

const authFile = "tests-e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
	// ログインページに移動
	await page.goto("/login");

	// 環境変数からテストユーザーの認証情報を取得
	const email = process.env.TEST_USER_EMAIL;
	const password = process.env.TEST_USER_PASSWORD;

	if (!email || !password) {
		throw new Error(
			"テスト用の環境変数 TEST_USER_EMAIL と TEST_USER_PASSWORD を設定してください。",
		);
	}

	// フォームを入力してサインイン
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill(password);
	await page.getByRole("button", { name: "Sign In" }).click();

	// ログイン後に表示される購入品登録ページの要素を待機
	await expect(page.getByLabel("購入品名")).toBeVisible({ timeout: 30000 });

	// 認証情報をファイルに保存
	await page.context().storageState({ path: authFile });
});
