import { test, expect } from "@playwright/test";

test("login e criar chamado", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("owner@acme.com");
  await page.getByLabel("Senha").fill("Admin@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/app/dashboard");

  await page.goto("/app/tickets/new");
  await page.getByLabel("Assunto").fill("Teste de chamado Playwright");
  await page.getByLabel("Descrição").fill("Chamado criado pelo teste de smoke.");
  await page.getByRole("button", { name: "Enviar chamado" }).click();

  await page.waitForURL(/\/app\/tickets\/.+/);
  await expect(page.getByText("Teste de chamado Playwright")).toBeVisible();
});
