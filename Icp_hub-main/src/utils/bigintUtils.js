// src/utils/bigintUtils.js
// Safe helpers for handling BigInt values returned from candid / Motoko

/**
 * Safely get a string representation of a value that might be a bigint
 * or number. Always returns a string.
 */
export function safeToString(value) {
  if (value === null || value === undefined) return String(value);
  // bigint literal in JS ends with n
  if (typeof value === "bigint") return value.toString();
  // candid may return objects for Nat? But most times it's number or bigint
  if (typeof value === "number") return String(value);
  // sometimes values come as strings already
  if (typeof value === "string") return value;
  // fallback to JSON
  try { return String(value); } catch (e) { return JSON.stringify(value); }
}

/**
 * Safely convert value to Number when it fits in JS safe range.
 * Returns {ok: true, value: number} or {ok: false, value: string}
 */
export function safeToNumber(value) {
  if (value === null || value === undefined) return { ok: true, value: Number(value) };
  if (typeof value === "number") return { ok: true, value };
  if (typeof value === "bigint") {
    const s = value.toString();
    // if length small enough, convert; otherwise decline
    const n = Number(s);
    if (BigInt(Number.MAX_SAFE_INTEGER) >= value) {
      return { ok: true, value: n };
    } else {
      return { ok: false, value: s };
    }
  }
  if (typeof value === "string") {
    // if the string is safe numeric
    const maybe = Number(value);
    if (!Number.isNaN(maybe) && Number.isSafeInteger(maybe)) return { ok: true, value: maybe };
    return { ok: false, value };
  }
  // fallback: try numeric conversion
  const maybe = Number(value);
  if (!Number.isNaN(maybe) && Number.isSafeInteger(maybe)) return { ok: true, value: maybe };
  return { ok: false, value: String(value) };
}

/**
 * For UI display: return a pretty string for bigints/numbers
 * Example: use safeDisplay(balance)
 */
export function safeDisplay(value) {
  return safeToString(value);
}

