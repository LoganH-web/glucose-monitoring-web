import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { sign } from "../src/lib/eaglenos/sign";

const md5 = (s: string) => createHash("md5").update(s, "utf8").digest("hex");

describe("eaglenos sign()", () => {
  it("sorts keys naturally and concatenates key+value before md5", () => {
    const salt = "TEST_SALT";
    const input = { timestamp: "1700000000", uuid: "abc-123" };
    // expected concat: salt + timestamp + uuid (sorted): saltTEST_SALTtimestamp1700000000uuidabc-123
    const expected = md5("saltTEST_SALTtimestamp1700000000uuidabc-123");
    expect(sign(input, salt)).toBe(expected);
  });

  it("includes token when provided", () => {
    const salt = "S";
    const input = { timestamp: "1", uuid: "u", token: "T" };
    // sorted: salt, timestamp, token, uuid → saltStimestamp1tokenTuuidu
    const expected = md5("saltStimestamp1tokenTuuidu");
    expect(sign(input, salt)).toBe(expected);
  });

  it("omits token when empty string", () => {
    const salt = "S";
    const a = sign({ timestamp: "1", uuid: "u", token: "" }, salt);
    const b = sign({ timestamp: "1", uuid: "u" }, salt);
    expect(a).toBe(b);
  });

  it("is deterministic across calls", () => {
    const salt = "X";
    const a = sign({ timestamp: "100", uuid: "yyy" }, salt);
    const b = sign({ timestamp: "100", uuid: "yyy" }, salt);
    expect(a).toBe(b);
  });

  it("supports key=value query-style concatenation", () => {
    const salt = "TEST_SALT";
    const input = { timestamp: "1700000000", uuid: "abc-123" };
    const expected = md5("salt=TEST_SALT&timestamp=1700000000&uuid=abc-123");
    expect(sign(input, salt, "query")).toBe(expected);
  });

  it("can include endpoint-specific params when needed", () => {
    const salt = "S";
    const input = {
      timestamp: "1",
      uuid: "u",
      extra: { sn: "SN123", max_id: 0 },
    };
    const expected = md5("max_id0saltSsnSN123timestamp1uuidu");
    expect(sign(input, salt)).toBe(expected);
  });
});
