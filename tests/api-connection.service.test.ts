import { afterEach, describe, expect, it } from "vitest";
import { getApiConnection, resetApiConnection, updateApiConnection } from "@/src/services/api-connection.service";

describe("runtime API connections", () => {
  afterEach(() => resetApiConnection("tomtom-traffic"));

  it("replaces a provider token without changing source configuration", () => {
    updateApiConnection("tomtom-traffic", { token: "temporary-education-key" });
    expect(getApiConnection("tomtom-traffic").token).toBe("temporary-education-key");
    updateApiConnection("tomtom-traffic", { token: "replacement-key" });
    expect(getApiConnection("tomtom-traffic").token).toBe("replacement-key");
  });

  it("rejects unsafe non-local HTTP endpoints", () => {
    expect(() => updateApiConnection("tomtom-traffic", { endpoint: "http://example.com/traffic" })).toThrow();
  });
});
