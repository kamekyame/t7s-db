import { getDoc, querySelectorAll, trimBrackets } from "./util.ts";

const pageUrl = "https://t7s.jp/release/cd.html";

if (import.meta.main) {
  const cds = await getCds();
  console.log(cds);
}

async function getCd(url: string) {
  const doc = await getDoc(url);

  const sm = doc.querySelector(".box-release-cover__txt--sm")?.textContent;
  const smMatch = sm?.match(/(\d+)年(\d+)月(\d+)日/);
  if (!smMatch) throw Error("Failed to get implementaion date : " + sm);
  const releaseDate = `${smMatch[1]}-${smMatch[2]}-${smMatch[3]}`;

  const artistAndReleaseType = doc.querySelector(".box-release-cover__txt--md")
    ?.textContent;

  const title = trimBrackets(
    doc.querySelector(".box-release-cover__txt--la span")
      ?.textContent,
  );

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
    releaseDate,
    artistAndReleaseType,
    title,
    info,
    jacketSrc,
  };
}

export async function getCds() {
  const url = pageUrl;
  const cds = [];

  const doc = await getDoc(url);
  const cover = querySelectorAll(doc, ".box-release-cover");
  for await (const element of cover) {
    const detailHref = element.querySelector(".btn-detail__anc")?.getAttribute(
      "href",
    );
    if (!detailHref) throw Error("Failed to get ingame url");
    const detailUrl = new URL(detailHref, url);

    const cd = await getCd(detailUrl.href);
    cds.push(cd);
  }
  return cds;
}
