import { getDoc, querySelectorAll } from "./util.ts";

const pageUrl = "https://t7s.jp/release/dvd.html";

if (import.meta.main) {
  const dvds = await getDvds();
  console.log(dvds);
}

async function getDvd(url: string) {
  const doc = await getDoc(url);

  const sm = doc.querySelector(".box-release-cover__txt--sm")?.textContent;
  const smMatch = sm?.match(/(\d+)年(\d+)月(\d+)日/);
  if (!smMatch) throw Error("Failed to get implementaion date : " + sm);
  const implementationDate = `${smMatch[1]}-${smMatch[2]}-${smMatch[3]}`;

  const artistAndReleaseType = doc.querySelector(".box-release-cover__txt--md")
    ?.textContent;

  const title = doc.querySelector(".box-release-cover__txt--la")?.textContent
    .trim()
    .slice(1, -1);

  let info = doc.querySelector(".box-release-detail__info")?.textContent;
  info = info?.split("\n").map((t) => t.trim()).join("\n").trim();

  let jacketSrc = doc.querySelector(".box-release-cover__img")?.getAttribute(
    "src",
  );
  jacketSrc = jacketSrc && new URL(jacketSrc, url).href;

  if (!sm || !artistAndReleaseType || !title || !info || !jacketSrc) {
    throw Error("Failed to get metadata : " + title);
  }

  return {
    url,
    implementationDate,
    artistAndReleaseType,
    title,
    info,
    jacketSrc,
  };
}

export async function getDvds() {
  const url = pageUrl;
  const dvds = [];

  const doc = await getDoc(url);
  const cover = querySelectorAll(doc, ".box-release-cover");

  for await (const element of cover) {
    const detailHref = element.querySelector(".btn-detail__anc")?.getAttribute(
      "href",
    );
    if (!detailHref) throw Error("Failed to get ingame url");
    const detailUrl = new URL(detailHref, url);

    const dvd = await getDvd(detailUrl.href);
    dvds.push(dvd);
  }
  return dvds;
}
