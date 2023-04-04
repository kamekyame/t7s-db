import { getDoc, querySelectorAll } from "./util.ts";

const pageUrl = "https://t7s.jp/release/index.html";

if (import.meta.main) {
  const ingames = await getIngames();
  console.log(ingames);
}

async function getIngame(url: string) {
  const doc = await getDoc(url);

  const creditStr = doc.querySelector(".box-release-cover__credit")
    ?.textContent;
  const lyrics = creditStr?.match(/作詞：(.*)/)?.[1];
  const compose = creditStr?.match(/作曲：(.*)/)?.[1];

  let lead = doc.querySelector(".box-release-detail__lead")?.textContent;
  lead = lead?.split("\n").map((t) => t.trim()).join("\n").trim();

  let jacketSrc = doc.querySelector(".box-release-cover__img")?.getAttribute(
    "src",
  );
  jacketSrc = jacketSrc && new URL(jacketSrc, url).href;

  if (!lead || !jacketSrc || !lyrics || !compose) {
    throw Error("Failed to get metadata : " + url);
  }

  return {
    url,
    lead,
    jacketSrc,
    credit: {
      lyrics,
      compose,
    },
  };
}

export async function getIngames() {
  const url = pageUrl;
  const ingames = [];

  const doc = await getDoc(url);
  const cover = querySelectorAll(doc, ".box-release-cover");
  for await (const element of cover) {
    const sm = element.querySelector(".box-release-cover__txt--sm")
      ?.textContent;
    const smMatch = sm?.match(/(\d+)年(\d+)月(\d+)日/);
    if (!smMatch) throw Error("Failed to get implementaion date : " + sm);
    const implementationDate = `${smMatch[1]}-${smMatch[2]}-${smMatch[3]}`;

    const artistAndReleaseType = element.querySelector(
      ".box-release-cover__txt--md",
    )
      ?.textContent;
    const title = element.querySelector(".box-release-cover__txt--la span")
      ?.textContent
      .slice(1, -1);
    if (!artistAndReleaseType || !title) {
      throw Error("Failed to get metadata");
    }

    const ingameHref = element.querySelector(".btn-detail__anc")?.getAttribute(
      "href",
    );
    if (!ingameHref) throw Error("Failed to get ingame url");
    const ingameUrl = new URL(ingameHref, url);

    const ingame = {
      ...await getIngame(ingameUrl.href),
      implementationDate,
      artistAndReleaseType,
      title,
    };
    ingames.push(ingame);
  }
  return ingames;
}
