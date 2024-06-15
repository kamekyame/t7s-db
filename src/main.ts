import { getCharacters } from "./character.ts";
import { getUnits } from "./unit.ts";
import { getIngames } from "./ingame.ts";
import { getCds } from "./cd.ts";
import { getDvds } from "./dvd.ts";
import { CD, Character, DVD, Ingame, Unit } from "./types.ts";

const characters: Character[] = await getCharacters();
const units: Unit[] = await getUnits();
const ingames_ = await getIngames();
const cds_ = await getCds();
const dvds_ = await getDvds();

function parseArtistAndReleaseType(artistAndReleaseType: string) {
  artistAndReleaseType = artistAndReleaseType.replaceAll("’", "'");
  artistAndReleaseType = artistAndReleaseType.replaceAll("＋", "+");

  let artist;
  if (artistAndReleaseType.includes("Tokyo 7th シスターズ")) {
    artist = "Tokyo 7th シスターズ";
  } else {
    const unit = units.find((u) => artistAndReleaseType.includes(u.name));
    if (unit) artist = unit.name;
    else {
      const character = characters.find((c) =>
        artistAndReleaseType.includes(c.name)
      );
      if (character) artist = character.name;
    }
  }

  let releaseType: string | undefined = artistAndReleaseType.replace(
    artist ?? "",
    "",
  )
    .trim();
  if (!releaseType) releaseType = undefined;
  return { artist, releaseType };
}

const ingames: Ingame[] = ingames_.map((ingame) => {
  const { artistAndReleaseType, ...others } = ingame;

  const { artist, releaseType } = parseArtistAndReleaseType(
    artistAndReleaseType,
  );
  if (!artist) {
    throw Error("Failed to find artist : " + artistAndReleaseType);
  }

  return { artist, releaseType, ...others };
});

const cds: CD[] = cds_.map((cd) => {
  const { artistAndReleaseType, ...others } = cd;

  const { artist, releaseType } = parseArtistAndReleaseType(
    artistAndReleaseType,
  );

  return { artist, releaseType, ...others };
});

const dvds: DVD[] = dvds_.map((dvd) => {
  const { artistAndReleaseType, ...others } = dvd;

  const { artist, releaseType } = parseArtistAndReleaseType(
    artistAndReleaseType,
  );

  return { artist, releaseType, ...others };
});

function sortFn(a: { url: string }, b: { url: string }) {
  return a.url.localeCompare(b.url);
}

const data = {
  characters: characters.sort(sortFn),
  units: units.sort(sortFn),
  ingames: ingames.sort(sortFn),
  cds: cds.sort(sortFn),
  dvds: dvds.sort(sortFn),
};

await Deno.writeTextFile("data.json", JSON.stringify(data, null, 2));

// console.log(data);
