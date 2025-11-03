import fs from "fs/promises";
import { Browser, Page } from "puppeteer-core";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import {
  CHROMIUM_EXECUTABLE,
  GOOGLE_COOKIES_FILE,
  GOOGLE_PASSWORD,
} from "./config";

const stealth = StealthPlugin();
stealth.enabledEvasions.delete("iframe.contentWindow");
stealth.enabledEvasions.delete("media.codecs");
puppeteer.use(stealth);

export async function getCookie() {
  const browser: Browser = await puppeteer.launch({
    executablePath: CHROMIUM_EXECUTABLE,
    args: ["--no-sandbox"],
  });

  const googleCookies = JSON.parse(
    await fs.readFile(GOOGLE_COOKIES_FILE, "utf-8"),
  );

  await browser.setCookie(...googleCookies);

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
  );

  await page.goto("https://divisist2.ufps.edu.co/", {
    waitUntil: "domcontentloaded",
  });

  await page.evaluate(() => {
    // @ts-ignore
    login_google();
  });

  try {
    await page.waitForSelector(".user-image", {
      timeout: 5000,
    });
  } catch (err) {
    await login(page);

    await page.waitForSelector(".user-image", {
      timeout: 5000,
    });
  }

  const cookies = await page.cookies("https://divisist2.ufps.edu.co/");

  const sessionCookie = cookies.find((c) => c.name === "ci_session");

  if (!sessionCookie) throw new Error("Cookie not found");

  await browser.close();

  return sessionCookie.value;
}

async function login(page: Page) {
  await forceClick(page, '[data-button-type="multipleChoiceIdentifier"]');

  const passwordInput = await page.waitForSelector("input[type=password]", {
    visible: true,
  });

  await passwordInput?.type(GOOGLE_PASSWORD);

  await page.keyboard.press("Enter");
}

async function forceClick(page: Page, selector: string, timeout = 5000) {
  await page.waitForFunction(
    (selector) => {
      const elem = document.querySelector(selector) as HTMLElement;
      const exists = elem !== null;

      if (exists) {
        elem.click();
      }

      console.log(selector, exists);

      return exists;
    },
    {
      timeout,
    },
    selector,
  );
}
