import { authenticator } from "otplib";
import { Browser, Page } from "puppeteer-core";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import {
  CHROMIUM_EXECUTABLE,
  GOOGLE_EMAIL,
  GOOGLE_PASSWORD,
  GOOGLE_TOTP_SECRET,
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

  await page.waitForNavigation();
  await page.locator("input[type=email]").fill(GOOGLE_EMAIL);
  await page.keyboard.press("Enter");

  const passwordInput = await page.waitForSelector("input[type=password]", {
    visible: true,
  });

  await passwordInput?.type(GOOGLE_PASSWORD);

  await page.keyboard.press("Enter");

  try {
    await page.waitForSelector(".user-image", {
      timeout: 5000,
    });
  } catch (err) {
    await handle2StepAuth(page);
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

async function forceClick(page: Page, selector: string, timeout = 5000) {
  await page.waitForFunction(
    (selector) => {
      const elem = document.querySelector(selector) as HTMLElement;
      const exists = elem !== null;

      if (exists) {
        elem.click();
      }

      return exists;
    },
    {
      timeout,
    },
    selector,
  );
}

async function handle2StepAuth(page: Page) {
  try {
    // If google directly tries to use notification login
    await forceClick(page, "main div:nth-of-type(2) button", 2000);
  } catch (err) {}

  await forceClick(page, "[data-challengeid='4']");

  const tokenInput = await page.waitForSelector("#totpPin", {
    visible: true,
  });

  await tokenInput?.type(authenticator.generate(GOOGLE_TOTP_SECRET));

  await forceClick(page, "#totpNext");
}
