import { describe, test } from "node:test"
import assert from "node:assert/strict"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

// The public site reaches the hand-drawn effects, the focus ring and new-tab
// links only through the primitives in this folder, so each is drawn the same
// way everywhere and changes in one place. Feature and layout code that needs
// one uses a primitive (SketchShape, Pill, SmartLink, ...) instead.

const ROOT = fileURLToPath(new URL("../../../", import.meta.url))

// Public code: components and routes, but not the admin (which is shadcn's),
// the API, or shadcn's own components
const SCOPE = ["src/components", "src/app"]
const OUTSIDE = ["src/components/ui/", "src/app/admin/", "src/app/api/"]
const SYSTEM = "src/components/system/"

// The bottom nav draws its bar, items and logo with the effects directly:
// it has its own system of hovers and shadows
const NAV_CHROME = ["src/components/layout/BottomNav.tsx", "src/components/logo/LogoOutline.tsx"]

const EFFECT = /^(sketch(-subtle)?(-animated)?|ink(-subtle|-fine)?|boil(-sm|-lg)?)$/
const FOCUS = /^focus-ring(-.+)?$/

type Finding = { file: string; line: number; what: string }

// Classes in the file's strings, by their utility (without variants like
// parent-hover:), and its JSX `target` attributes
export function findRawUses(file: string, source: string) {
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const effects: Finding[] = []
  const focus: Finding[] = []
  const newTabs: Finding[] = []
  const lineOf = (node: ts.Node) =>
    sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1

  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateLiteralToken(node)) {
      for (const token of node.text.split(/\s+/)) {
        const utility = token.split(":").pop()!.replace(/^!/, "")
        if (EFFECT.test(utility)) effects.push({ file, line: lineOf(node), what: token })
        if (FOCUS.test(utility)) focus.push({ file, line: lineOf(node), what: token })
      }
    }
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === "target") {
      newTabs.push({ file, line: lineOf(node), what: node.getText(sourceFile) })
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return { effects, focus, newTabs }
}

function publicFiles() {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`
      if (OUTSIDE.some((prefix) => `${path}/`.startsWith(prefix))) continue
      if (entry.isDirectory()) walk(path)
      else if (/\.tsx?$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) files.push(path)
    }
  }
  SCOPE.forEach(walk)
  return files
}

const show = (findings: Finding[]) =>
  findings.map(({ file, line, what }) => `${relative(ROOT, join(ROOT, file))}:${line} ${what}`)

describe("design system boundaries", () => {
  const found = publicFiles()
    .filter((file) => !file.startsWith(SYSTEM))
    .map((file) => findRawUses(file, readFileSync(join(ROOT, file), "utf8")))

  test("effects (sketch, ink, boil) are only used by primitives", () => {
    const effects = found.flatMap((f) => f.effects).filter((f) => !NAV_CHROME.includes(f.file))
    assert.deepEqual(show(effects), [])
  })

  test("the focus ring is only set by primitives", () => {
    assert.deepEqual(show(found.flatMap((f) => f.focus)), [])
  })

  test("only SmartLink opens links in a new tab", () => {
    assert.deepEqual(show(found.flatMap((f) => f.newTabs)), [])
  })

  test("the check finds classes behind variants, in any string", () => {
    const sample = [
      `const a = cn("p-2 parent-hover:boil-sm", x && \`ink \${y}\`)`,
      `const b = <a className="group-hover/tile:sketch-subtle-animated focus-ring-rust" target="_blank" />`,
      `// sketch in a comment isn't a class`,
    ].join("\n")
    const { effects, focus, newTabs } = findRawUses("sample.tsx", sample)
    assert.deepEqual(
      effects.map((f) => f.what),
      ["parent-hover:boil-sm", "ink", "group-hover/tile:sketch-subtle-animated"],
    )
    assert.deepEqual(focus.map((f) => f.what), ["focus-ring-rust"])
    assert.equal(newTabs.length, 1)
  })
})
