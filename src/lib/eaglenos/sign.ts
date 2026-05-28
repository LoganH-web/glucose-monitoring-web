import { createHash, randomUUID } from "node:crypto";

/**
 * Sign per Eaglenos APP Common Interface Parameters spec.
 *
 * Algorithm from the API doc:
 *   sign = md5(concat(sortedByKey([timestamp, uuid, token, salt])))
 *
 * The doc says "key-value concatenation", but vendor docs commonly omit
 * whether this means `keyvalue`, `key=value&...`, or sorted values only,
 * so the client can try each format.
 */
export type ConcatStyle = "kv" | "query" | "value";
export type SignCase = "lower" | "upper";
export type SignOrder = "alpha" | "doc";

export interface SignInput {
  timestamp: string;
  uuid: string;
  token?: string;
  extra?: Record<string, string | number | undefined>;
}

export function sign(
  input: SignInput,
  salt: string,
  style: ConcatStyle = "kv",
  order: SignOrder = "alpha",
  signCase: SignCase = "lower"
): string {
  const parts: Record<string, string> = {
    timestamp: input.timestamp,
    uuid: input.uuid,
    salt,
  };
  if (input.token !== undefined && input.token !== "") {
    parts.token = input.token;
  }
  if (input.extra) {
    Object.entries(input.extra).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        parts[key] = String(value);
      }
    });
  }

  const keys =
    order === "doc"
      ? ["timestamp", "uuid", "token", "salt", ...Object.keys(parts).sort()]
          .filter((key, index, arr) => parts[key] !== undefined && arr.indexOf(key) === index)
      : Object.keys(parts).sort();
  const concat =
    style === "kv"
      ? keys.map((key) => `${key}${parts[key]}`).join("")
      : style === "query"
        ? keys.map((key) => `${key}=${parts[key]}`).join("&")
        : keys.map((key) => parts[key]).join("");

  const digest = createHash("md5").update(concat, "utf8").digest("hex");
  return signCase === "upper" ? digest.toUpperCase() : digest;
}

export function makeTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function makeUuid(): string {
  return randomUUID();
}
