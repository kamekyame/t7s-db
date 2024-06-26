import { DOMParser, Element, HTMLDocument } from "@b-fuze/deno-dom";
import { green, red } from "@std/fmt/colors";
import { dirname, resolve } from "@std/path";

const useCache = Deno.args.includes("--update") === false;

export async function getDoc(url: string | URL) {
  const text = await getHtml(url);
  const doc = new DOMParser().parseFromString(text, "text/html");
  if (doc === null) throw Error("[dom] Failed to parse html");
  return doc;
}

async function getHtml(url: string | URL) {
  if (typeof url === "string") url = new URL(url);
  const filePath = resolve(Deno.cwd(), "./t7s.jp/" + url.pathname);
  let text: string;
  if (useCache) {
    try {
      text = await Deno.readTextFile(filePath);
      console.log(green(`[html] Load cache "${url.href}"`));
      return text;
    } catch {
      console.log(red(`[html] No cache! "${url.href}"`));
    }
  }
  const res = await fetch(url);
  text = await res.text();
  await Deno.mkdir(dirname(filePath), { recursive: true });
  await Deno.writeTextFile(filePath, text);
  console.log(green(`[html] fetch "${url.href}"`));
  return text;
}

export function querySelectorAll(
  doc: Element | HTMLDocument,
  selectors: string,
) {
  const nodeList = doc.querySelectorAll(selectors);
  return Array.from(nodeList) as Element[];
}

export function trimBrackets(str?: string) {
  const match = str?.trim().match(/^「?(.*?)」?$/);
  if (!match) return undefined;
  return match[1];
}
