import { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { CHROMIUM_EXECUTABLE, GOOGLE_EMAIL, GOOGLE_PASSWORD } from "./config";

const stealth = StealthPlugin();
stealth.enabledEvasions.delete("iframe.contentWindow");
stealth.enabledEvasions.delete("media.codecs");
puppeteer.use(stealth);

export async function getCookie() {
  const browser: Browser = await puppeteer.launch({
    executablePath: CHROMIUM_EXECUTABLE,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
  );

  await page.goto("https://divisist2.ufps.edu.co/");

  await page.evaluate(() => {
    // @ts-ignore
    login_google();
  });

  await page.waitForNavigation();

  await page.locator("input[type=email]").fill(GOOGLE_EMAIL);

  await page.keyboard.press("Enter");

  const passwordInput = await page.waitForSelector("input[type=password]", {
    visible: true,
  });

  await passwordInput?.type(GOOGLE_PASSWORD);

  await page.keyboard.press("Enter");

  await page.waitForSelector(".user-image", {
    timeout: 5000,
  });

  const cookies = await page.cookies("https://divisist2.ufps.edu.co/");

  const sessionCookie = cookies.find((c) => c.name === "ci_session");

  if (!sessionCookie) throw new Error("Cookie not found");

  await browser.close();

  return sessionCookie.value;
}
