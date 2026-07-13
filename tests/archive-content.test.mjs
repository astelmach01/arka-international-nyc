import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSafeArchive,
  cleanInjectedPage,
  isLegacyThemePost,
} from "../scripts/build-archive-data.mjs";

test("cleanInjectedPage removes hidden spam while retaining useful store information", () => {
  const input = `
    <p>Store Hours:</p><p>Tuesday: 12 pm – 6 pm</p>
    <div style="opacity: 0.01; height: 1px">
      <a href="https://spam.example">บาคาร่าออนไลน์</a>
    </div>`;

  assert.equal(cleanInjectedPage(input), "Store Hours:\nTuesday: 12 pm – 6 pm");
});

test("isLegacyThemePost identifies the recovered WordPress demo entries", () => {
  assert.equal(
    isLegacyThemePost({
      slug: "post-standard-one",
      title: { rendered: "Post Standard One" },
      content: { rendered: "The world was so recent that many things lacked names." },
    }),
    true,
  );
  assert.equal(
    isLegacyThemePost({
      slug: "pysanka-workshop",
      title: { rendered: "Pysanka Workshop" },
      content: { rendered: "Join Arka for a traditional workshop." },
    }),
    false,
  );
});

test("buildSafeArchive excludes compromised records and labels theme-demo posts", () => {
  const posts = [
    {
      id: 1,
      date: "2015-02-17T10:48:16",
      slug: "hello-world",
      title: { rendered: "Hello world!" },
      excerpt: { rendered: "<p>Welcome to WordPress.</p>" },
      content: { rendered: "<p>Welcome to WordPress.</p>" },
    },
    {
      id: 2,
      date: "2026-01-01T00:00:00",
      slug: "casino-bonus",
      title: { rendered: "Casino bonus" },
      excerpt: { rendered: "<p>Bet now</p>" },
      content: { rendered: "<p>Bet now</p>" },
    },
  ];

  const result = buildSafeArchive(posts, new Set([2]));

  assert.deepEqual(result, [
    {
      id: 1,
      date: "February 17, 2015",
      isoDate: "2015-02-17T10:48:16",
      slug: "hello-world",
      title: "Hello world!",
      excerpt: "Welcome to WordPress.",
      provenance: "WordPress theme demo",
    },
  ]);
});
