import fs from "fs/promises";
import { Browser } from "puppeteer-core";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { CHROMIUM_EXECUTABLE, GOOGLE_COOKIES_FILE } from "./config";

const stealth = StealthPlugin();
stealth.enabledEvasions.delete("iframe.contentWindow");
stealth.enabledEvasions.delete("media.codecs");
puppeteer.use(stealth);

(async () => {
  const browser: Browser = await puppeteer.launch({
    executablePath: CHROMIUM_EXECUTABLE,
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://accounts.google.com");

  await page.waitForResponse((response) => {
    const url = new URL(response.url());

    return (
      url.host === "myaccount.google.com" &&
      response.status() === 200 &&
      url.searchParams.get("pli") !== null
    );
  });

  const cookies = await page.cookies();

  await fs.writeFile(GOOGLE_COOKIES_FILE, JSON.stringify(cookies));

  console.log("Cookies saved to", GOOGLE_COOKIES_FILE);

  await browser.close();
})();
