import puppeteer from "puppeteer";

const mins = [
  "haridus_ja_teadusministeerium",
  "justiitsministeerium",
  "kaitseministeerium",
  "keskkonnaministeerium",
  "kultuuriministeerium",
  "majandus_ja_kommunikatsiooniministeerium",
  "pollumajandusministeerium",
  "rahandusministeerium",
  "siseministeerium",
  "sotsiaalministeerium",
  "valisministeerium",
];

const url = (min) =>
  `https://www.eesti.ee/est/kontaktid/ministeeriumid_1/${min}`;

(async () => {
  const browser = await puppeteer.launch();

  const data = await Promise.all(
    mins.map(async (min) => {
      const page = await browser.newPage();
      await page.goto(url(min), { waitUntil: "networkidle0" });

      return await page.evaluate(() => {
        const title = document.querySelector(".box05-a h1").textContent.trim();

        const url = document.querySelector(".box07-c a").getAttribute("href");

        const address = document
          .querySelector(".box07-a address")
          .textContent.trim();

        let services = [];
        if (
          document
            .querySelector(".tabs li:first-child")
            .getAttribute("class") === "active"
        ) {
          services = Array.from(
            document.querySelectorAll(".tab-content-a ul li a")
          ).map((el) => {
            const path = el
              .getAttribute("href")
              .split("/")
              .map((i) => i.replace("_1", ""));
            return {
              title: el.innerText.trim(),
              url: `https://www.eesti.ee${el.getAttribute("href")}`,
              domain: path[4],
            };
          });
        }

        const related = Array.from(
          document.querySelectorAll(".box05-b ul li a")
        ).map((el) => {
          const path = el
            .getAttribute("href")
            .split("/")
            .map((i) => i.replace("_1", ""));
          return {
            title: el.innerText.trim(),
            url: `https://www.eesti.ee${el.getAttribute("href")}`,
            domain: path[3],
            subdomain: path[4],
          };
        });

        return {
          title,
          url,
          address,
          services,
          related,
        };
      });
    })
  );

  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();

/*
const contains = (el, text) => `//${el}[contains(., '${text}')]`;
const [button] = await page.$x(contains("button", "Click me"));
if (button) {
  await button.click();
}
*/
