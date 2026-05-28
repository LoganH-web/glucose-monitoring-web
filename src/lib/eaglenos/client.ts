import { EAGLENOS_SUCCESS, type EaglenosListResponse } from "./types";
import {
  type ConcatStyle,
  type SignCase,
  type SignOrder,
  makeTimestamp,
  sign,
} from "./sign";

const MAX_PAGES = 50;
const PAGE_SIZE = 100;
type BodyStyle = "form" | "json";
type SignScope = "common" | "all";
type TokenSignMode = "signed" | "unsigned";

export interface SyncResult {
  readings: EaglenosListResponse["data"]["list"];
  deviceInfo?: EaglenosListResponse["data"]["device_info"];
  pagesFetched: number;
}

interface FetchOptions {
  /** Stable per-user client UUID. */
  uuid: string;
}

function cleanEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if ((first === `"` && last === `"`) || (first === `'` && last === `'`)) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function safePrefix(value: string): string {
  return value.length <= 8 ? value : `${value.slice(0, 8)}...`;
}

function signStyles(): ConcatStyle[] {
  const configured = cleanEnv(process.env.EAGLENOS_SIGN_STYLE);
  if (configured === "value") return ["value", "kv", "query"];
  if (configured === "query") return ["query", "value", "kv"];
  return ["value", "kv", "query"];
}

function signOrders(): SignOrder[] {
  const configured = cleanEnv(process.env.EAGLENOS_SIGN_ORDER);
  if (configured === "doc") return ["doc", "alpha"];
  return ["alpha", "doc"];
}

function signCases(): SignCase[] {
  const configured = cleanEnv(process.env.EAGLENOS_SIGN_CASE);
  if (configured === "upper") return ["upper", "lower"];
  return ["lower", "upper"];
}

function bodyStyles(): BodyStyle[] {
  const configured = cleanEnv(process.env.EAGLENOS_BODY_STYLE);
  if (configured === "json") return ["json", "form"];
  return ["form", "json"];
}

function signScopes(): SignScope[] {
  const configured = cleanEnv(process.env.EAGLENOS_SIGN_SCOPE);
  if (configured === "all") return ["all", "common"];
  return ["common", "all"];
}

function tokenSignModes(hasToken: boolean): TokenSignMode[] {
  if (!hasToken) return ["unsigned"];
  const configured = cleanEnv(process.env.EAGLENOS_TOKEN_SIGN_MODE);
  if (configured === "unsigned") return ["unsigned", "signed"];
  return ["signed", "unsigned"];
}

function shouldRetryVendorError(code: number): boolean {
  return code === 100001 || code === 200003;
}

function debugEaglenos(): boolean {
  return cleanEnv(process.env.EAGLENOS_DEBUG) === "true";
}

function encodeBody(
  body: Record<string, string | number>,
  style: BodyStyle
): { contentType: string; body: string } {
  if (style === "json") {
    return {
      contentType: "application/json",
      body: JSON.stringify(body),
    };
  }

  const form = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => form.set(key, String(value)));
  return {
    contentType: "application/x-www-form-urlencoded",
    body: form.toString(),
  };
}

function getBloodSugarEndpoint(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/api/bloodsugar/getListBySn")) {
    return normalized;
  }

  return `${normalized}/api/bloodsugar/getListBySn`;
}

/**
 * Fetch one page of readings for a device SN.
 * `maxId` is the cursor: Eaglenos returns up to 100 rows with id > maxId.
 */
export async function getReadingsBySn(
  sn: string,
  maxId: number,
  opts: FetchOptions
): Promise<EaglenosListResponse> {
  const baseUrl = cleanEnv(process.env.EAGLENOS_BASE_URL);
  const salt = cleanEnv(process.env.EAGLENOS_SALT);
  const token = cleanEnv(process.env.EAGLENOS_TOKEN);
  if (!baseUrl) throw new Error("EAGLENOS_BASE_URL not set");
  if (!salt) throw new Error("EAGLENOS_SALT not set");

  const normalizedSn = sn.trim();
  const normalizedMaxId = Number(maxId);
  const normalizedUuid = opts.uuid.trim();

  if (!normalizedSn) throw new Error("Device serial number is empty");
  if (!Number.isInteger(normalizedMaxId) || normalizedMaxId < 0) {
    throw new Error("Invalid Eaglenos cursor");
  }
  if (!normalizedUuid) throw new Error("Eaglenos UUID is empty");

  const timestamp = makeTimestamp();
  const endpoint = getBloodSugarEndpoint(baseUrl);

  let lastError: EaglenosListResponse | null = null;
  const attempts: string[] = [];

  for (const bodyStyle of bodyStyles()) {
    for (const signScope of signScopes()) {
      for (const signStyle of signStyles()) {
        for (const tokenSignMode of tokenSignModes(Boolean(token))) {
          for (const signOrder of signOrders()) {
            for (const signCase of signCases()) {
              attempts.push(
                `${bodyStyle}:${signStyle}:${signScope}:${tokenSignMode}:${signOrder}:${signCase}`
              );
              const signature = sign(
                {
                  timestamp,
                  uuid: normalizedUuid,
                  token: tokenSignMode === "signed" ? token : undefined,
                  extra:
                    signScope === "all"
                      ? { sn: normalizedSn, max_id: normalizedMaxId }
                      : undefined,
                },
                salt,
                signStyle,
                signOrder,
                signCase
              );
              const payload: Record<string, string | number> = {
                sn: normalizedSn,
                max_id: normalizedMaxId,
                uuid: normalizedUuid,
                timestamp,
                sign: signature,
              };
              if (token) payload.token = token;

              const encoded = encodeBody(payload, bodyStyle);

              const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": encoded.contentType,
                  "User-Agent": "eaglenos",
                },
                body: encoded.body,
                cache: "no-store",
              });

              if (!res.ok) {
                throw new Error(`Eaglenos HTTP ${res.status}: ${await res.text()}`);
              }

              const json = (await res.json()) as EaglenosListResponse;
              if (json.code === EAGLENOS_SUCCESS) {
                if (debugEaglenos()) {
                  console.info("Eaglenos sync accepted", {
                    sn: normalizedSn,
                    max_id: normalizedMaxId,
                    uuid: safePrefix(normalizedUuid),
                    timestamp,
                    bodyStyle,
                    signStyle,
                    signScope,
                    tokenSignMode,
                    signOrder,
                    signCase,
                  });
                }
                return json;
              }

              lastError = json;
              if (debugEaglenos()) {
                console.warn("Eaglenos sync rejected", {
                  code: json.code,
                  msg: json.msg,
                  sn: normalizedSn,
                  max_id: normalizedMaxId,
                  uuid: safePrefix(normalizedUuid),
                  timestamp,
                  saltLength: salt.length,
                  hasToken: Boolean(token),
                  bodyStyle,
                  signStyle,
                  signScope,
                  tokenSignMode,
                  signOrder,
                  signCase,
                });
              }

              if (!shouldRetryVendorError(json.code)) {
                throw new Error(
                  `Eaglenos error code ${json.code}: ${json.msg}. Request meta: sn=${normalizedSn}, max_id=${normalizedMaxId}, uuid=${safePrefix(normalizedUuid)}, timestamp=${timestamp}, saltLength=${salt.length}, hasToken=${Boolean(token)}, attempts=${attempts.join(",")}`
                );
              }
            }
          }
        }
      }
    }
  }

  throw new Error(
    `Eaglenos error code ${lastError?.code ?? "unknown"}: ${lastError?.msg ?? "unknown"}. Request meta: sn=${normalizedSn}, max_id=${normalizedMaxId}, uuid=${safePrefix(normalizedUuid)}, timestamp=${timestamp}, saltLength=${salt.length}, hasToken=${Boolean(token)}, attempts=${attempts.join(",")}`
  );
}

/**
 * Pull every page from the given starting cursor up to MAX_PAGES.
 * Stops early when a page returns fewer than PAGE_SIZE rows.
 * Returns rows in ascending id order so they can be bulk-inserted as-is.
 */
export async function syncAll(
  sn: string,
  startingMaxId: number,
  opts: FetchOptions
): Promise<SyncResult> {
  let cursor = startingMaxId;
  let pagesFetched = 0;
  const readings: EaglenosListResponse["data"]["list"] = [];
  let deviceInfo: EaglenosListResponse["data"]["device_info"] | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const resp = await getReadingsBySn(sn, cursor, opts);
    pagesFetched++;
    const list = resp.data.list ?? [];
    if (resp.data.device_info) deviceInfo = resp.data.device_info;
    if (list.length === 0) break;

    readings.push(...list);
    const lastId = list.reduce((max, reading) => (reading.id > max ? reading.id : max), cursor);
    if (lastId === cursor) break;
    cursor = lastId;

    if (list.length < PAGE_SIZE) break;
  }

  return { readings, deviceInfo, pagesFetched };
}
