// Utilities for converting Chinese characters to pinyin, enabling pinyin-based search.

import { syllables, indicesBase64 } from "./pinyin_data.js";

// Decode the base64-encoded Uint16Array.
const indicesArray = (() => {
  const binary = atob(indicesBase64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return new Uint16Array(buf.buffer);
})();

const CJK_START = 0x4E00;
const CJK_END = 0x9FFF;

function isCjk(code) {
  return code >= CJK_START && code <= CJK_END;
}

// Returns true if the string contains any CJK characters.
export function hasChinese(str) {
  for (let i = 0; i < str.length; i++) {
    if (isCjk(str.charCodeAt(i))) return true;
  }
  return false;
}

// Returns the pinyin syllable for a single CJK character, or null if unknown.
function charToPinyin(charCode) {
  if (!isCjk(charCode)) return null;
  const idx = indicesArray[charCode - CJK_START];
  return idx > 0 ? syllables[idx - 1] : null;
}

// Converts a string to its full pinyin (no tones, no spaces). Non-CJK characters are
// preserved as-is. Example: "北京" → "beijing", "hello北京" → "hellobeijing".
export function toPinyin(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const py = charToPinyin(code);
    result += py != null ? py : str[i];
  }
  return result;
}

// Returns a string of the first letters of each CJK character's pinyin.
// Non-CJK characters are preserved. Example: "北京" → "bj", "hello北京" → "hellobj".
export function toPinyinInitials(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const py = charToPinyin(code);
    result += py != null ? py[0] : str[i];
  }
  return result;
}
