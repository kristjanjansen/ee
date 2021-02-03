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

const minUrls = mins.map(
  (min) => `https://www.eesti.ee/est/kontaktid/ministeeriumid_1/${min}`
);

const pis = [
  "asutuse_kontaktid/vabariigi_presidendi_kantselei",
  "asutuse_kontaktid/riigikogu_kantselei",
  "asutuse_kontaktid/oiguskantsleri_kantselei",
  "asutuse_kontaktid/riigikontroll_1",
  //"asutuse_kontaktid/kohtud",
  "asutuse_kontaktid/eesti_pank_1",
  "asutuse_kontaktid/sihtasutus_keskkonnainvesteeringute_keskus",
  "audiitorkogu",
  "eesti_advokatuur",
  "eesti_arengufond",
  "eesti_haigekassa_3",
  "eesti_kultuurkapital",
  "eesti_kunstiakadeemia",
  "eesti_maaulikool",
  "eesti_muusika_ja_teatriakadeemia",
  "eesti_rahvusraamatukogu",
  "eesti_rahvusringhaaling_1",
  "eesti_teaduste_akadeemia",
  "eesti_tootukassa",
  "finantsinspektsioon",
  "kaitseliit_1",
  "keemilise_ja_bioloogilise_fuusika_instituut",
  "kohtutaiturite_ja_pankrotihaldurite_koda",
  "notarite_koda",
  "patendivolinike_koda",
  "rahvusooper_estonia",
  "tagatisfond",
  "tallinna_tehnikaulikool",
  "tallinna_ulikool",
  "tartu_ulikool",
];

const piUrls = pis.map((pi) => `https://www.eesti.ee/est/kontaktid/${pi}`);

(async () => {
  const browser = await puppeteer.launch();

  const data = await Promise.all(
    [...minUrls, ...piUrls].map(async (url) => {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle0" });

      return await page.evaluate(() => {
        const title = document.querySelector(".box05-a h1")?.textContent.trim();

        const url = document.querySelector?.(".box07-c a").getAttribute("href");

        const address = document
          .querySelector?.(".box07-a address")
          .textContent.trim();

        const services = Array.from(
          document.querySelectorAll("#tab-content-teenused ul li a")
        ).map((el) => {
          const path = el
            .getAttribute?.("href")
            .split("/")
            .map((i) => i.replace("_1", ""));
          return {
            title: el.innerText.trim(),
            url: `https://www.eesti.ee${el?.getAttribute("href")}`,
            domain: path[4],
          };
        });

        const related = Array.from(
          document.querySelectorAll(".box05-b ul li a")
        ).map((el) => {
          const path = el
            .getAttribute?.("href")
            .split("/")
            .map((i) => i.replace("_1", ""));
          return {
            title: el.innerText.trim(),
            url: `https://www.eesti.ee${el.getAttribute?.("href")}`,
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
