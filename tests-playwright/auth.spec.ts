import { test, expect } from "@playwright/test";

const TEST_USER_EMAIL = "moyuyora@mirai.re";
const TEST_USER_PASSWORD = "MIrR}wZa2vAn";

test.describe("Authentication", () => {
	test("should allow a user to sign in and sign out", async ({ page }) => {
		await page.goto("/login");
		await page.getByLabel("Email").fill(TEST_USER_EMAIL);
		await page.getByLabel("Password").fill(TEST_USER_PASSWORD);
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page).toHaveURL("/");
		
		await page.getByRole("button", { name: "Logout" }).click();

		await expect(page).toHaveURL("/login");
	});
});
