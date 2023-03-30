import { getDoc, querySelectorAll } from "./util.ts";

const pageUrl = "https://t7s.jp/character/unit.html";

const stageName2name = new Map(Object.entries({
  "HAL": "春日部ハル",
  "Rona": "角森ロナ",
  "HI-ME": "野ノ原ヒメ",
  "100Ka": "芹沢モモカ",
  "ウスタスミレ": "臼田スミレ",
  "カミシロスイ": "神城スイ",
  "クオンジシズカ": "久遠寺シズカ",
  "MUSUBI": "天堂寺ムスビ",
  "SUSU": "アレサンドラ・スース",
  "さわら": "晴海サワラ",
  "かじか": "晴海カジカ",
  "しぃちゃん": "晴海シンジュ",
  "キョーコ": "上杉・ウエバス・キョーコ",
  "レナ": "荒木レナ",
  "ホノカ": "西園ホノカ",
  "E.MURASAKI": "越前ムラサキ",
  "S.FERB": "瀬戸ファーブ",
  "S.YUMENO": "堺屋ユメノ",
  "M.MATSURI": "三森マツリ",
  "MAKOTO TAMASAKA": "玉坂マコト",
  "AYUMU ORIKASA": "折笠アユム",
  "SISALA KAWASUMI": "川澄シサラ",
  "MIWAKO AZAMI": "浅見ミワコ",
  "CHACHA OOTORI": "鳳チャチャ",
  "MIMI FUTAGAWA": "二川ミミ",
  "TOMOE SHIRATORI": "白鳥トモエ",
  "RISYURI MAEZONO": "前園リシュリ",
  "MIU AIHARA": "逢原ミウ",
  "SAWORI YAMAI": "夜舞サヲリ",
  "MADOKA ENAMI": "榎並マドカ",
  "MONAKA KUMOMAKI": "雲巻モナカ",
  "XIAO FEI HUNG": "シャオ・ヘイフォン",
  "HARU KASUKABE": "春日部ハル",
  "KAJIKA HARUMI": "晴海カジカ",
  "ALESSANDRA SUSU": "アレサンドラ・スース",
  "SUMIRE USUTA": "臼田スミレ",
  "蓬莱タキ": "蓬󠄀莱タキ",
}));

async function getUnit(url: URL) {
  const doc = await getDoc(url);

  const visualImgRelSrc = doc.querySelector(".box-unit-detail__visual img")
    ?.getAttribute("src");
  if (!visualImgRelSrc) {
    throw Error("Failed to get character visual image url");
  }
  const visualImgSrc = new URL(visualImgRelSrc, url.href).href;

  const logoImgRelSrc = doc.querySelector(".box-unit-detail__logo img")
    ?.getAttribute("src");
  if (!logoImgRelSrc) throw Error("Failed to get character logo image url");
  const logoImgSrc = new URL(logoImgRelSrc, url.href).href;

  let info = doc.querySelector(".box-unit-detail__info p")?.textContent;
  info = info?.trim();
  info = info?.split("\n").map((t) => t.trim()).join("");

  const members = [];

  const menberElements = querySelectorAll(doc, ".box-unit-member li");
  for await (const element of menberElements) {
    const faceImgEl = element.querySelector(".box-unit-member__face img");
    const faceImgRelSrc = faceImgEl?.getAttribute("src");
    if (!faceImgRelSrc) {
      throw Error("Failed to get character face image url");
    }
    const faceImgSrc = new URL(faceImgRelSrc, url.href).href;

    const stageName = faceImgEl?.getAttribute("alt");
    if (!stageName) throw Error("Failed to get character name");

    const name = stageName2name.get(stageName) ?? stageName;

    members.push({
      stageName,
      name,
      faceImgSrc,
    });
  }

  return {
    url: url.href,
    members,
    visualImgSrc,
    logoImgSrc,
  };
}

export async function getUnits() {
  const doc = await getDoc(pageUrl);

  const groupElements = querySelectorAll(doc, ".box-unit-list__group");

  const units = [];

  for await (const element of groupElements) {
    const groupEl = element.querySelector(".ttl-character__ttl");
    let groupName = groupEl?.textContent;
    if (groupName === "ナナスタワールド") groupName = "ナナスタW";
    else if (
      groupName === "Roots." &&
      Array.from(groupEl?.parentElement?.classList ?? []).includes(
        "ttl-character--2053rival",
      )
    ) groupName = "2053 ライバル";
    else if (groupName === "enemy") groupName = "エネミー";
    if (!groupName) throw Error("Failed to get group name");

    const charaElements = querySelectorAll(element, ".box-unit-list__list a");
    for await (const element of charaElements) {
      let name = element.querySelector(".ttl-unit img")?.getAttribute("alt");
      name = name?.replaceAll("(", "（").replaceAll(")", "）");
      if (name === "nanabanaotome") name = "七花少女";
      if (!name) throw Error("Failed to get character name");

      const unitPageHref = element.getAttribute("href");
      if (!unitPageHref) throw Error("Failed to get character page url");
      const unitPageUrl = new URL(unitPageHref, pageUrl);

      const unit = { ...await getUnit(unitPageUrl), name, group: groupName };
      units.push(unit);
    }
  }
  return units;
}
