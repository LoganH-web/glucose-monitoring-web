import { createHash, randomUUID } from "node:crypto";

/**
 * Sign per Eaglenos APP Common Interface Parameters spec.
 *
 * Algorithm from the API doc:
 *   sign = md5(concat(sortedByKey([timestamp, uuid, token, salt])))
 *
 * The doc says "key-value concatenation", but vendor docs commonly omit
 * whether this means `keyvalue` or `key=value&...`, so both are supported.
 */
export type ConcatStyle = "kv" | "query";

export interface SignInput {
  timestamp: string;
  uuid: string;
  token?: string;
  extra?: Record<string, string | number | undefined>;
}

export function sign(input: SignInput, salt: string, style: ConcatStyle = "kv"): string {
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

  const keys = Object.keys(parts).sort();
  const concat =
    style === "kv"
      ? keys.map((key) => `${key}${parts[key]}`).join("")
      : keys.map((key) => `${key}=${parts[key]}`).join("&");

  return createHash("md5").update(concat, "utf8").digest("hex");
}

export function makeTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function makeUuid(): string {
  return randomUUID();
}
