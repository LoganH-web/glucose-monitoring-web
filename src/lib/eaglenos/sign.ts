import { createHash, randomUUID } from "node:crypto";

/**
 * Sign per Eaglenos APP Common Interface Parameters spec.
 *
 * Algorithm (from the API doc):
 *   sign = md5( concat( sortedByKey([timestamp, uuid, token, salt]) ) )
 *
 * "Concatenation" is interpreted as key+value (no separator). If Eaglenos
 * later confirms a different format (e.g. key=value&...), swap CONCAT_STYLE.
 *
 * `token` is included only when provided (the doc says "include if logged in").
 * Since our MVP does its own auth and never logs into Eaglenos, callers pass
 * `token` undefined and it is omitted from the signed payload.
 */
type ConcatStyle = "kv" | "query";
const CONCAT_STYLE: ConcatStyle = "kv";

export interface SignInput {
  timestamp: string;
  uuid: string;
  token?: string;
}

export function sign(input: SignInput, salt: string): string {
  const parts: Record<string, string> = {
    timestamp: input.timestamp,
    uuid: input.uuid,
    salt,
  };
  if (input.token !== undefined && input.token !== "") {
    parts.token = input.token;
  }

  const keys = Object.keys(parts).sort();
  const concat =
    CONCAT_STYLE === "kv"
      ? keys.map((k) => `${k}${parts[k]}`).join("")
      : keys.map((k) => `${k}=${parts[k]}`).join("&");

  return createHash("md5").update(concat, "utf8").digest("hex");
}

export function makeTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function makeUuid(): string {
  return randomUUID();
}
