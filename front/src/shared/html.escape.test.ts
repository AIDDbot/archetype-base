import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml } from "./html.escape.ts";

void test("escapeHtml protects text and quoted attributes", () => {
  assert.equal(escapeHtml("<script>\"&'"), "&lt;script&gt;&quot;&amp;&#39;");
});
