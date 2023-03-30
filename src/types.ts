export type Character = {
  url: string;
  group: string;
  name: string;
  info: string;
  age?: number;
  birthday?: { month: number; day: number };
  bloodType?: string;
  height: number;
  weight: number;
  threeSize?: { b: string; w: string; h: string };
  cv: string;
  nickname: string[];
  skill?: string;
  favorite: string;
  affiliation?: string;
  unit: string[];
  normalImgSrc?: string;
  idolImgSrc?: string;
  imgImgSrc?: string;
};

export type Unit = {
  url: string;
  name: string;
  group: string;
  members: {
    stageName: string;
    faceImgSrc: string;
    name: string;
  }[];
  visualImgSrc?: string;
  logoImgSrc?: string;
};

export type InGame = {
  url: string;
  implementationDate: string;
  artist: string;
  releaseType?: string;
  title: string;
  lead: string;
  jacketSrc: string;
  credit: {
    lyrics: string;
    music: string;
  };
};

export type CD = {
  url: string;
  title: string;
  implementationDate: string;
  artist?: string;
  releaseType?: string;
  info: string;
  jacketSrc: string;
};

export type DVD = {
  url: string;
  title: string;
  implementationDate: string;
  artist?: string;
  releaseType?: string;
  info: string;
  jacketSrc: string;
};
