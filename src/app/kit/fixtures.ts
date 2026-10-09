import type { PageData } from "@/components/pages/PageBody";
import type { PageKey } from "@/config/pages";
import type { PageView } from "@/lib/pages";
import type { CalendarEvent } from "@/types/event";
import type { LetterboxdReview } from "@/types/letterboxd";
import type { SubstackPost } from "@/types/post";

// Content for the /kit pages: every page rendered from made-up data, with no
// Firestore or feeds, so the screenshots in tests/kit.spec.ts stay put. The
// data exercises each branch the components have (several tickets, no image,
// a long review, an unset color role).

// A flat picture with a label, as a data URL so nothing is fetched
function picture(color: string, width: number, height: number, label = "") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${color}"/><circle cx="${width * 0.72}" cy="${height * 0.38}" r="${height * 0.22}" fill="#efecdf" fill-opacity="0.35"/><text x="${width / 2}" y="${height * 0.82}" font-family="Georgia" font-size="${height * 0.09}" fill="#efecdf" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const pages: Record<PageKey, PageView> = {
  home: {
    key: "home",
    title: "",
    subtitle: "",
    colors: {
      background: "#c1c8c2",
      foreground: "#1c303a",
      ink: "#1c303a",
      edge: "#1c303a",
      accent: "#375b6d",
      accentEdge: "#1c303a",
      accentText: "#efecdf",
    },
    sections: [
      {
        key: "about",
        kind: "text",
        label: "Who we are",
        content:
          "DC Movie Club is a group of film lovers who meet up to watch and talk about movies. Everyone's welcome, whether you've seen every Kubrick or just want a night out.\n\nWe host **screenings**, discussions and the occasional trivia night. [Come to an event](/events) or read [our newsletter](https://dcmovieclub.substack.com).",
      },
    ],
  },
  events: {
    key: "events",
    title: "Events",
    subtitle: "Screenings, discussions and more",
    colors: {
      background: "#a2390a",
      foreground: "#efecdf",
      ink: "#551e05",
      edge: "#551e05",
      accent: "#eca344",
      accentEdge: "#6e430b",
      accentText: "#393a3e",
    },
    sections: [
      {
        key: "intro",
        kind: "text",
        label: "How events work",
        content:
          "Most events are free. Ticketed screenings link to the theater's own page.\n\n- Arrive ten minutes early\n- Stay for the discussion after\n- Bring a friend",
      },
      {
        key: "types",
        kind: "faq",
        label: "Event types",
        items: [
          {
            key: "screening",
            question: "Screenings",
            answer:
              "We buy a block of seats at a local theater and watch together. Discussion follows at a nearby bar.",
          },
          {
            key: "discussion",
            question: "Discussion nights",
            answer:
              "Everyone watches the film at home during the week, then we meet to talk it through.\n\n1. Watch the film\n2. Bring one question\n3. Show up",
          },
        ],
      },
    ],
  },
  blog: {
    key: "blog",
    title: "Blog",
    subtitle: "Reviews and dispatches from the club",
    colors: {
      background: "#ca6c84",
      foreground: "#efecdf",
      ink: "#431823",
      edge: "#431823",
      accent: "#375b6d",
      accentEdge: "#1c303a",
      accentText: "#efecdf",
    },
    sections: [],
  },
  about: {
    key: "about",
    title: "About",
    subtitle: "",
    // Card text left unset, so it falls back to the lettering outline
    colors: {
      background: "#b1ad26",
      foreground: "#393a3e",
      ink: "#43420e",
      edge: "#43420e",
      accent: "#6372af",
      accentEdge: "#313a5f",
      accentText: "#efecdf",
    },
    sections: [
      {
        key: "intro",
        kind: "text",
        label: "Our story",
        content:
          "## Started in 2023\n\nA handful of friends started meeting after screenings at the AFI Silver. It grew from there.\n\n> The best part of a movie is the conversation after.\n\n:::details[How do I join?]\nJust show up to an event!\n:::",
      },
      {
        key: "news",
        kind: "cards",
        label: "In the News",
        items: [
          {
            key: "a",
            title: "The movie club bringing strangers together over arthouse films",
            url: "https://example.com/a",
            source: "City Cast DC",
            image: picture("#375b6d", 640, 360, "City Cast"),
          },
          {
            key: "b",
            title: "Where to watch movies with other people in DC",
            url: "https://example.com/b",
            source: "Washingtonian",
            image: "",
          },
          {
            key: "c",
            title: "A film club for people who don't think they're film people",
            url: "",
            source: "DCist",
            image: picture("#6372af", 640, 360, "DCist"),
          },
        ],
      },
      {
        key: "faq",
        kind: "faq",
        label: "FAQ",
        items: [
          {
            key: "cost",
            question: "Does it cost anything?",
            answer: "Membership is free. Some screenings are ticketed.",
          },
          {
            key: "kids",
            question: "Can I bring someone who isn't a member?",
            answer: "Of course. Everyone is welcome at every event.",
          },
        ],
      },
      {
        key: "conduct",
        kind: "text",
        label: "Code of Conduct",
        content:
          "Be kind. Disagree about movies, not people.\n\n### Reporting\n\nTalk to any organizer, or write to us.",
      },
    ],
  },
  partnerships: {
    key: "partnerships",
    title: "Partnerships",
    subtitle: "",
    colors: {
      background: "#57a7cc",
      foreground: "#183d4e",
      cardText: "#183d4e",
      ink: "#183d4e",
      edge: "#183d4e",
      accent: "#a2390a",
      accentEdge: "#551e05",
      accentText: "#efecdf",
    },
    sections: [
      {
        key: "collab",
        kind: "text",
        label: "Collaborate",
        content:
          "We partner with theaters, festivals and local businesses to put on screenings.",
      },
      {
        key: "partners",
        kind: "tags",
        label: "Partners",
        items: [
          { key: "afi", title: "AFI Silver", url: "https://example.com/afi" },
          { key: "miracle", title: "Miracle Theatre", url: "" },
          { key: "loews", title: "Alamo Drafthouse", url: "https://example.com/alamo" },
          { key: "filmfest", title: "Filmfest DC", url: "" },
        ],
      },
      {
        key: "links",
        kind: "links",
        label: "Press kit",
        items: [
          { key: "kit", title: "Download our press kit", url: "https://example.com/kit" },
          { key: "about", title: "About the club", url: "/about" },
          { key: "plain", title: "Logos on request", url: "" },
        ],
      },
    ],
  },
};

const events: CalendarEvent[] = [
  {
    id: "featured",
    title: "In the Mood for Love: 25th Anniversary",
    description:
      "<p>Wong Kar-wai's masterpiece returns to the big screen in a new 4K restoration. Join us for the screening, then stay for a discussion at <a href=\"https://example.com/bar\">the bar next door</a>.</p><p>Tickets are limited, so grab yours early. We'll have a reserved block in the center of the theater, and an organizer will be at the door from 6:30.</p><p>After the film we'll talk about the music, the cinematography and the hallway scenes everyone remembers.</p>",
    location: "AFI Silver Theatre, Silver Spring",
    start: "2026-11-14T23:30:00.000Z",
    end: "2026-11-15T02:00:00.000Z",
    allDay: false,
    link: null,
    tickets: [
      { label: "Friday 7:30 PM", url: "https://example.com/t1" },
      { label: "Saturday 2:00 PM", url: "https://example.com/t2" },
    ],
  },
  {
    id: "single-ticket",
    title: "Paris, Texas",
    description: null,
    location: "Miracle Theatre",
    start: "2026-11-21T00:00:00.000Z",
    end: "2026-11-21T02:30:00.000Z",
    allDay: false,
    link: null,
    tickets: [{ label: "Tickets", url: "https://example.com/t3" }],
  },
  {
    id: "link-only",
    title: "Discussion Night: Past Lives and the art of the slow burn",
    description: null,
    location: null,
    start: "2026-12-03T00:00:00.000Z",
    end: "2026-12-03T02:00:00.000Z",
    allDay: false,
    link: "https://example.com/calendar",
    tickets: [],
  },
  {
    id: "all-day",
    title: "Holiday Movie Marathon",
    description: null,
    location: "Somewhere cozy",
    start: "2026-12-19",
    end: "2026-12-20",
    allDay: true,
    link: null,
    tickets: [],
  },
  {
    id: "next-year",
    title: "Oscar Shorts",
    description: null,
    location: "Landmark E Street",
    start: "2027-01-23T19:00:00.000Z",
    end: "2027-01-23T21:00:00.000Z",
    allDay: false,
    link: "https://example.com/shorts",
    tickets: [],
  },
];

const posts: SubstackPost[] = [
  {
    title: "Tickets on sale: In the Mood for Love",
    link: "https://example.com/p0",
    description: "An announcement that never leads the blog",
    bodyHtml: null,
    pubDate: "2026-10-01T12:00:00.000Z",
    isEvent: true,
    imageUrl: null,
    blurDataUrl: null,
  },
  {
    title: "What we watched in September",
    link: "https://example.com/p1",
    description: "Ten films, three arguments and one walkout",
    bodyHtml:
      "<p>September was a big month for the club. We saw ten films together, from a sold-out screening of <a href=\"https://example.com/film\">Perfect Days</a> to a midnight horror double feature.</p><h2>The highlights</h2><p>The discussion after Perfect Days ran past closing time. Here's what people kept coming back to:</p><ul><li>The toilets, obviously</li><li>Lou Reed on the drive home</li><li>Whether Hirayama is happy</li></ul><blockquote><p>It's a movie about noticing things.</p></blockquote><h3>Next month</h3><p>We're planning a Wong Kar-wai weekend. <mark>Tickets go fast</mark>, so keep an eye on the newsletter.</p><p><a class=\"button\" href=\"https://example.com/events\">See events</a></p><hr><p>Thanks to everyone who came out.</p>",
    pubDate: "2026-10-03T12:00:00.000Z",
    isEvent: false,
    imageUrl: picture("#375b6d", 1200, 630, "September"),
    blurDataUrl: null,
  },
  {
    title: "Why we keep going back to the AFI Silver",
    link: "https://example.com/p2",
    description: "A love letter to a theater",
    bodyHtml: null,
    pubDate: "2026-09-12T12:00:00.000Z",
    isEvent: false,
    imageUrl: picture("#a2390a", 1200, 630, "AFI Silver"),
    blurDataUrl: null,
  },
  {
    title: "A field guide to post-screening small talk",
    link: "https://example.com/p3",
    description: null,
    bodyHtml: null,
    pubDate: "2026-08-20T12:00:00.000Z",
    isEvent: false,
    imageUrl: null,
    blurDataUrl: null,
  },
  {
    title: "Our first year",
    link: "https://example.com/p4",
    description: "Looking back at how it started, and the dozen people at that first screening",
    bodyHtml: null,
    pubDate: "2025-12-30T12:00:00.000Z",
    isEvent: false,
    imageUrl: picture("#6372af", 1200, 630, "Year one"),
    blurDataUrl: null,
  },
];

const reviews: LetterboxdReview[] = [
  {
    id: "r1",
    filmTitle: "Perfect Days",
    filmYear: 2023,
    posterUrl: picture("#375b6d", 230, 345, "Perfect Days"),
    rating: 4.5,
    liked: true,
    review:
      "A quiet film about routine that somehow made the whole theater cry. Hirayama's mornings stayed with me for weeks, and I've started noticing the light through the trees on my own walk to work.",
    reviewer: "Abbie",
    diaryDate: "2026-09-28",
    url: "https://example.com/r1",
  },
  {
    id: "r2",
    filmTitle: "Past Lives",
    filmYear: 2023,
    posterUrl: picture("#ca6c84", 230, 345, "Past Lives"),
    rating: 4,
    liked: false,
    review: null,
    reviewer: null,
    diaryDate: "2026-09-21",
    url: "https://example.com/r2",
  },
  {
    id: "r3",
    filmTitle: "The Holdovers",
    filmYear: 2023,
    posterUrl: null,
    rating: 3.5,
    liked: true,
    review: null,
    reviewer: null,
    diaryDate: null,
    url: "https://example.com/r3",
  },
  {
    id: "r4",
    filmTitle: "Aftersun",
    filmYear: 2022,
    posterUrl: picture("#b1ad26", 230, 345, "Aftersun"),
    rating: null,
    liked: false,
    review: null,
    reviewer: null,
    diaryDate: "2026-09-02",
    url: "https://example.com/r4",
  },
];

export const kitPageKeys = Object.keys(pages) as PageKey[];

export function kitPage(key: PageKey): PageView {
  return pages[key];
}

// What loadPageData would give each page
export function kitPageData(key: PageKey): PageData {
  return {
    events: key === "home" || key === "events" ? events : [],
    posts: key === "home" || key === "blog" ? posts : [],
    reviews: key === "home" ? reviews : [],
    eventsPage: key === "home" ? pages.events : null,
    aboutPage: key === "home" ? pages.about : null,
    partnershipsPage: key === "home" ? pages.partnerships : null,
    blogPage: key === "home" ? pages.blog : null,
  };
}

// The bottom nav's colors, as getPageAccents and getPageBackgrounds give them
export const kitAccents: Record<string, string> = {
  "/": "#9e2726",
  "/events": pages.events.colors.accent!,
  "/blog": pages.blog.colors.accent!,
  "/about": pages.about.colors.accent!,
  "/partnerships": pages.partnerships.colors.accent!,
};

export const kitBackgrounds: Record<string, string> = Object.fromEntries(
  kitPageKeys.map((key) => [`/kit/${key}`, pages[key].colors.background!]),
);
