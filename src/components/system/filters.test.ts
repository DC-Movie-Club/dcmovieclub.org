import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { sketchFilters } from "./filters.ts"

// globals.css names the filters by id, in the utilities and in the redraws'
// and boils' keyframes. A name with no filter draws nothing, silently.
const css = readFileSync(new URL("../../styles/globals.css", import.meta.url), "utf8")
const named = new Set([...css.matchAll(/url\(#([\w-]+)\)/g)].map((match) => match[1]))
const defined = new Set(sketchFilters.map((filter) => filter.id))

test("every filter the CSS names is defined", () => {
  assert.deepEqual([...named].filter((id) => !defined.has(id)), [])
})

test("every filter defined is named in the CSS", () => {
  assert.deepEqual([...defined].filter((id) => !named.has(id)), [])
})
