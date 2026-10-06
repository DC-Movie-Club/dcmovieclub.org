import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parseYouTubeId, youTubeWatchUrl } from "./youtube.ts"

const ID = "dQw4w9WgXcQ"

describe("parseYouTubeId", () => {
  it("reads the video ID from every kind of video link", () => {
    for (const url of [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/watch?v=${ID}&list=PLx9&index=2&t=30s`,
      `https://www.youtube.com/watch?app=desktop&v=${ID}`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://youtube.com/watch?v=${ID}#t=1m`,
      `https://youtu.be/${ID}?si=Hx_abc-123`,
      `https://www.youtube.com/shorts/${ID}?feature=share`,
      `https://www.youtube.com/embed/${ID}?start=10`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `http://www.youtube.com/v/${ID}`,
      `  https://youtu.be/${ID}\n`,
    ]) {
      assert.equal(parseYouTubeId(url), ID, url)
    }
  })

  it("keeps dashes and underscores in the ID", () => {
    assert.equal(parseYouTubeId("https://youtu.be/a-b_c-d_e-f"), "a-b_c-d_e-f")
  })

  it("rejects YouTube pages that aren't a single video", () => {
    for (const url of [
      "https://www.youtube.com/",
      "https://www.youtube.com/@dcmovieclub",
      "https://www.youtube.com/playlist?list=PLx9",
      "https://www.youtube.com/results?search_query=paddington",
      "https://www.youtube.com/watch?v=",
    ]) {
      assert.equal(parseYouTubeId(url), null, url)
    }
  })

  it("rejects other hosts, look-alikes and links without a scheme", () => {
    for (const url of [
      `https://vimeo.com/${ID}`,
      `https://notyoutube.com/watch?v=${ID}`,
      `https://www.youtube.com.example.com/watch?v=${ID}`,
      `https://music.youtube.com/watch?v=${ID}`,
      `www.youtube.com/watch?v=${ID}`,
    ]) {
      assert.equal(parseYouTubeId(url), null, url)
    }
  })

  it("rejects IDs that aren't 11 characters", () => {
    for (const url of [
      `https://youtu.be/${ID}/`,
      "https://youtu.be/dQw4w9",
      `https://www.youtube.com/watch?v=${ID}x`,
    ]) {
      assert.equal(parseYouTubeId(url), null, url)
    }
  })
})

describe("youTubeWatchUrl", () => {
  it("builds the watch link, which reads back as the same ID", () => {
    const url = youTubeWatchUrl(ID)
    assert.equal(url, `https://www.youtube.com/watch?v=${ID}`)
    assert.equal(parseYouTubeId(url), ID)
  })
})
