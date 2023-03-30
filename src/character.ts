import { getDoc, querySelectorAll } from "./util.ts";

const pageUrl = "https://t7s.jp/character/index.html";

async function getCharacter(url: URL) {
  const doc = await getDoc(url);

  const name = doc.querySelector(".chara-modal-ttl__ttl img")?.getAttribute(
    "alt",
  );
  let info = doc.querySelector(".chara-modal__info p")?.textContent;
  info = info?.trim();
  info = info?.split("\n").map((t) => t.trim()).join("");

  let age: number | undefined,
    birthday: {
      month: number;
      day: number;
    } | undefined,
    bloodType: string | undefined,
    height: number | undefined,
    weight: number | undefined,
    threeSize: { b: string; w: string; h: string } | undefined,
    cv: string | undefined,
    nickname: string[] = [],
    skill: string | undefined,
    favorite: string | undefined,
    affiliation: string | undefined,
    unit: string[] = [];

  const rowElements = querySelectorAll(doc, ".chara-modal-data__row");
  for await (const element of rowElements) {
    const key = element.querySelector(".chara-modal-data__ttl")?.textContent;
    const value = element.querySelector(".chara-modal-data__cont")
      ?.textContent;
    if (!key || !value) throw Error("Failed to get character data");
    try {
      switch (key) {
        case "年齢": {
          const m = value.match(/(\d+)歳/);
          if (!m) age = undefined; // 非公表がいる
          else age = Number(m[1]);
          break;
        }
        case "誕生日": {
          const m = value.match(/(\d+)月(\d+)日/);
          if (!m) birthday = undefined; // 非公表がいる
          else birthday = { month: Number(m[1]), day: Number(m[2]) };
          break;
        }
        case "血液型": {
          const m = value.match(/(\w)型/);
          if (!m) bloodType = undefined; // 非公表がいる
          else bloodType = m[1];
          break;
        }
        case "身長体重": {
          const m = value.match(/(\d+)cm／(\d+)kg/);
          if (!m) throw Error();
          height = Number(m[1]);
          weight = Number(m[2]);
          break;
        }
        case "スリーサイズ": {
          const m = value.match(/B(\d+)／W(\d+)／H(\d+)/);
          if (!m) threeSize = undefined; // 非公表がいる
          else threeSize = { b: m[1], w: m[2], h: m[3] };
          break;
        }
        case "CV": {
          cv = value;
          break;
        }
        case "ニックネーム": {
          if (value === "なし") nickname = [];
          else nickname = value.split("、");
          break;
        }
        case "特技": {
          if (value === "？？") skill = undefined; // 非公表がいる
          else skill = value;
          break;
        }
        case "好きな物": {
          favorite = value;
          break;
        }
        case "所属": {
          if (value === "？？") affiliation = undefined; // 非公表がいる
          else affiliation = value;
          break;
        }
        case "ユニット": {
          if (value === "-") unit = [];
          else unit = value.split(/\/|／/);
          break;
        }
      }
    } catch (_) {
      throw Error(
        `Failed to get character data : chara=${name} key=${key} value=${value}`,
      );
    }
  }

  let normalImgSrc = doc.querySelector(`.pc-show .chara-modal__visual-normal`)
    ?.getAttribute("src");
  let idolImgSrc = doc.querySelector(`.pc-show .chara-modal__visual-idol`)
    ?.getAttribute("src");
  let imgImgSrc = doc.querySelector(`.pc-show .chara-modal__visual-img`)
    ?.getAttribute("src");

  normalImgSrc = normalImgSrc ? new URL(normalImgSrc, pageUrl).href : undefined;
  idolImgSrc = idolImgSrc ? new URL(idolImgSrc, pageUrl).href : undefined;
  imgImgSrc = imgImgSrc ? new URL(imgImgSrc, pageUrl).href : undefined;

  if (!name || !info || !height || !weight || !cv || !favorite) {
    throw Error("Failed to get character data");
  }

  return {
    url: url.href,
    name,
    info,
    age,
    birthday,
    bloodType,
    height,
    weight,
    threeSize,
    cv,
    nickname,
    skill,
    favorite,
    affiliation,
    unit,
    normalImgSrc,
    idolImgSrc,
    imgImgSrc,
  };
}

export async function getCharacters() {
  const doc = await getDoc(pageUrl);

  const groupElements = querySelectorAll(doc, ".box-character-list__group");

  const characters = [];

  for await (const element of groupElements) {
    let groupName = element.querySelector(".ttl-character__ttl")?.textContent;
    if (groupName === "ナナスタワールド") groupName = "ナナスタW";
    else if (groupName === "2053ライバル") groupName = "2053 ライバル";
    else if (groupName === "2053 ライバル") groupName = "ライバル";
    else if (groupName === "enemy") groupName = "エネミー";
    if (!groupName) throw Error("Failed to get group name");

    const charaElements = querySelectorAll(
      element,
      ".box-character-list__chara",
    );
    for await (const element of charaElements) {
      const charaPageHref = element.parentElement?.getAttribute("href");
      if (!charaPageHref) throw Error("Failed to get character page url");
      const charaPageUrl = new URL(charaPageHref, pageUrl);

      const character = {
        ...await getCharacter(charaPageUrl),
        group: groupName,
      };
      characters.push(character);
    }
  }
  return characters;
}
