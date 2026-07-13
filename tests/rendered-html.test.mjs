import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the recovered Arka catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Arka International \| Ukrainian Art/);
  assert.match(html, /Explore the collection/);
  assert.match(html, /Browse\s*(?:<!-- -->)?703(?:<!-- -->)?\s*objects/);
  assert.match(html, /89 East 2nd Street/);
  assert.match(html, /212-473-3550/);
  assert.match(html, /Legacy archive/);
  assert.match(html, /Recovered store hours/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
  assert.doesNotMatch(html, /casino|sportsbook|บาคาร่า|mostbet|kraken onion|betandreas/i);
});
