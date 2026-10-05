import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  contrastRatio,
  hexToOklch,
  hexToRgb,
  hsvToRgb,
  normalizeHex,
  oklchToHex,
  rgbToHex,
  rgbToHsv,
  shades,
} from "./color.ts"

const brand = [
  "#a2390a",
  "#b24d2a",
  "#efecdf",
  "#375b6d",
  "#393a3e",
  "#ca6c84",
  "#eca344",
  "#b1ad26",
  "#57a7cc",
  "#6372af",
]

function close(actual: number, expected: number, tolerance: number) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  )
}

describe("hexToRgb", () => {
  it("reads every hex length", () => {
    assert.deepEqual(hexToRgb("#a2390a"), { r: 162, g: 57, b: 10 })
    assert.deepEqual(hexToRgb("#A2390A"), { r: 162, g: 57, b: 10 })
    assert.deepEqual(hexToRgb("#fa0"), { r: 255, g: 170, b: 0 })
    assert.deepEqual(hexToRgb("#fa08"), { r: 255, g: 170, b: 0 })
    assert.deepEqual(hexToRgb("#a2390a80"), { r: 162, g: 57, b: 10 })
  })

  it("returns null for anything that isn't a hex color", () => {
    for (const value of ["", "#", "#a2", "#a2390", "a2390a", "#gggggg", "red"]) {
      assert.equal(hexToRgb(value), null, value)
    }
  })
})

describe("rgbToHex", () => {
  it("pads, lowercases, rounds and clamps", () => {
    assert.equal(rgbToHex({ r: 0, g: 10, b: 255 }), "#000aff")
    assert.equal(rgbToHex({ r: 161.6, g: -4, b: 300 }), "#a200ff")
  })

  it("round-trips the brand colors", () => {
    for (const hex of brand) assert.equal(rgbToHex(hexToRgb(hex)!), hex)
  })
})

describe("normalizeHex", () => {
  it("expands short forms and drops alpha", () => {
    assert.equal(normalizeHex("#FA0"), "#ffaa00")
    assert.equal(normalizeHex("#a2390a80"), "#a2390a")
    assert.equal(normalizeHex("nope"), null)
  })
})

describe("HSV", () => {
  it("converts primaries", () => {
    assert.deepEqual(rgbToHsv({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, v: 100 })
    assert.deepEqual(rgbToHsv({ r: 0, g: 0, b: 255 }), { h: 240, s: 100, v: 100 })
    assert.deepEqual(rgbToHsv({ r: 0, g: 0, b: 0 }), { h: 0, s: 0, v: 0 })
    assert.deepEqual(hsvToRgb({ h: 120, s: 100, v: 100 }), { r: 0, g: 255, b: 0 })
  })

  it("treats a hue of 360 as red", () => {
    assert.deepEqual(hsvToRgb({ h: 360, s: 100, v: 100 }), { r: 255, g: 0, b: 0 })
  })

  it("round-trips the brand colors", () => {
    for (const hex of brand) {
      assert.equal(rgbToHex(hsvToRgb(rgbToHsv(hexToRgb(hex)!))), hex)
    }
  })
})

describe("OKLCH", () => {
  it("matches reference values", () => {
    const white = hexToOklch("#ffffff")
    close(white.l, 1, 0.0001)
    close(white.c, 0, 0.0001)

    const black = hexToOklch("#000000")
    close(black.l, 0, 0.0001)

    // CSS Color 4 gives red as oklch(0.628 0.2577 29.23)
    const red = hexToOklch("#ff0000")
    close(red.l, 0.628, 0.001)
    close(red.c, 0.2577, 0.001)
    close(red.h, 29.23, 0.05)
  })

  it("keeps hue between 0 and 360", () => {
    const { h } = hexToOklch("#ca6c84")
    assert.ok(h >= 0 && h < 360)
    assert.ok(hexToOklch("#6372af").h > 180)
  })

  it("round-trips the brand colors", () => {
    for (const hex of brand) assert.equal(oklchToHex(hexToOklch(hex)), hex)
  })

  it("brings out-of-gamut colors into sRGB by lowering chroma", () => {
    const hex = oklchToHex({ l: 0.9, c: 0.4, h: 30 })
    assert.match(hex, /^#[0-9a-f]{6}$/)
    const mapped = hexToOklch(hex)
    close(mapped.l, 0.9, 0.01)
    assert.ok(mapped.c < 0.4)
    close(mapped.h, 30, 3)
  })

  it("clamps lightness", () => {
    assert.equal(oklchToHex({ l: 1.5, c: 0, h: 0 }), "#ffffff")
    assert.equal(oklchToHex({ l: -1, c: 0, h: 0 }), "#000000")
  })
})

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a color on itself", () => {
    close(contrastRatio("#000000", "#ffffff"), 21, 0.0001)
    close(contrastRatio("#a2390a", "#a2390a"), 1, 0.0001)
  })

  it("doesn't depend on order", () => {
    assert.equal(
      contrastRatio("#393a3e", "#efecdf"),
      contrastRatio("#efecdf", "#393a3e"),
    )
  })

  it("matches known WCAG values", () => {
    close(contrastRatio("#777777", "#ffffff"), 4.48, 0.01)
    close(contrastRatio("#767676", "#ffffff"), 4.54, 0.01)
    close(contrastRatio("#393a3e", "#efecdf"), 9.59, 0.01)
  })

  it("reads short hex forms", () => {
    close(contrastRatio("#000", "#fff"), 21, 0.0001)
  })
})

describe("shades", () => {
  it("steps lightness down and up around the color", () => {
    const { darker, lighter } = shades("#a2390a")
    assert.equal(darker.length, 4)
    assert.equal(lighter.length, 4)

    const base = hexToOklch("#a2390a").l
    const ls = [...darker, ...lighter].map((hex) => hexToOklch(hex).l)
    for (let i = 1; i < ls.length; i++) assert.ok(ls[i] > ls[i - 1])
    assert.ok(ls[3] < base && ls[4] > base)
  })

  it("keeps the hue", () => {
    const { darker, lighter } = shades("#375b6d")
    for (const hex of [...darker.slice(1), ...lighter.slice(0, -1)]) {
      close(hexToOklch(hex).h, hexToOklch("#375b6d").h, 6)
    }
  })

  it("lands near the hand-made dark brand shades", () => {
    const rustDark = hexToOklch("#551e05")
    const step = hexToOklch(shades("#a2390a").darker[2])
    close(step.l, rustDark.l, 0.03)
    close(step.c, rustDark.c, 0.02)
  })

  it("drops steps past black or white", () => {
    assert.deepEqual(shades("#ffffff").lighter, [])
    assert.deepEqual(shades("#000000").darker, [])
    assert.equal(shades("#ffffff").darker.length, 4)
  })

  it("never repeats the color itself", () => {
    for (const hex of brand) {
      const { darker, lighter } = shades(hex)
      assert.ok(![...darker, ...lighter].includes(hex), hex)
    }
  })

  it("takes a step count", () => {
    const { darker, lighter } = shades("#57a7cc", 2)
    assert.equal(darker.length, 2)
    assert.equal(lighter.length, 2)
  })
})
