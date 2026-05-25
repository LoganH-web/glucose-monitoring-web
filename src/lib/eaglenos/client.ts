import { EAGLENOS_SUCCESS, type EaglenosListResponse } from "./types";
import { makeTimestamp, sign } from "./sign";

const MAX_PAGES = 50;
const PAGE_SIZE = 100;

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
  const signature = sign({ timestamp, uuid: normalizedUuid }, salt);

  const body = {
    sn: normalizedSn,
    max_id: normalizedMaxId,
    uuid: normalizedUuid,
    timestamp,
    sign: signature,
  };

  const res = await fetch(`${baseUrl}/api/bloodsugar/getListBySn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "eaglenos",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Eaglenos HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as EaglenosListResponse;
  if (json.code !== EAGLENOS_SUCCESS) {
    throw new Error(
      `Eaglenos error code ${json.code}: ${json.msg}. Request meta: sn=${normalizedSn}, max_id=${normalizedMaxId}, uuid=${safePrefix(normalizedUuid)}, timestamp=${timestamp}, saltLength=${salt.length}`
    );
  }

  return json;
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
