import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { green, red } from "https://deno.land/std@0.181.0/fmt/colors.ts";
import { dirname, resolve } from "https://deno.land/std@0.181.0/path/mod.ts";

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
  try {
    text = await Deno.readTextFile(filePath);
    console.log(green(`[html] Exist cache! "${url.href}"`));
  } catch {
    console.log(red(`[html] No cache! "${url.href}"`));
    const res = await fetch(url);
    text = await res.text();
    await Deno.mkdir(dirname(filePath), { recursive: true });
    await Deno.writeTextFile(filePath, text);
    console.log(green(`[html] Cached "${url.href}"`));
  }
  return text;
}

export function querySelectorAll(
  doc: Element | HTMLDocument,
  selectors: string,
) {
  const nodeList = doc.querySelectorAll(selectors);
  return Array.from(nodeList) as Element[];
}
