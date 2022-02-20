import puppeteer from "puppeteer";
import { Args } from "./flags";
import { SendMessage } from "./telegram";
import { Wait } from "./wait";

let signal = "UNKNOWN";
let browser: puppeteer.Browser;

export const InitTradingViewTechnicals = async (
  ticker: string,
  interval: string
) => {
  while (true) {
    signal = "UNKNOWN";
    try {
      browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        timeout: 5000,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      console.log('Browser Launch Successful');
      let isBuy = false;
      let isSell = false;

      const page = await browser.newPage();
      await page.goto(
        `https://www.tradingview.com/symbols/${ticker}/technicals/`,
        {
          timeout: 10000,
        }
      );
      console.log('Navigation To Page Successful');
      await page.waitForSelector(`button[id="${interval}"]`, {
        timeout: 10000,
      });
      console.log('Button Found');
      while (true) {
        signal = "UNKNOWN";
        try {
          await page.click(`button[id="${interval}"]`);
          console.log('Button Clicked');
          await Wait(2);
          const elements = await page.$$(".speedometerSignal-DPgs-R4s");
          if (elements.length !== 3) {
            throw new Error(
              "Puppeteer could not fetch trade signals from TradingView"
            );
          } else {
            console.log('Speedometers Found');
          }
          const promises: any[] = [];
          elements.forEach((element, index) => {
            if (index === 1) {
              promises.push(
                page.evaluate((e) => {
                  return e.textContent;
                }, element)
              );
            }
          });
          const signals = await Promise.all(promises);
          isBuy =
            signals.filter((s) => s.includes("Strong Buy")).length ===
            signals.length;
          isSell =
            signals.filter((s) => s.includes("Strong Sell")).length ===
            signals.length;
          signal = isBuy
            ? "BUY"
            : isSell
            ? "SELL"
            : `WEAK ${signals[0].toUpperCase()}`;
        } catch (error) {
          console.error(error);
          signal = "ERROR";
          await SendMessage(
            Args.botToken,
            Args.chatId,
            JSON.stringify(error, null, 2)
          );
          break;
        }
        await Wait(5);
      }
    } catch (error) {
      signal = "ERROR";
      console.error(error);
      await SendMessage(
        Args.botToken,
        Args.chatId,
        JSON.stringify(error, null, 2)
      );
      try {
        await browser.close();
      } catch (error) {
        console.error(error);
        await SendMessage(
          Args.botToken,
          Args.chatId,
          JSON.stringify(error, null, 2)
        );
      }
    }
    await Wait(5);
  }
};

export const GetTradeSignal = (): string => {
  return signal;
};
