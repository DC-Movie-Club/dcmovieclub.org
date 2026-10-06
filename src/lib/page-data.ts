import "server-only";
import {
  getRecentLetterboxdReviews,
  getRecentPosts,
  getUpcomingEvents,
} from "@/lib/data";
import type { PageData } from "@/components/pages/PageBody";
import type { PageKey } from "@/config/pages";
import type { PageView } from "@/lib/pages";

const EMPTY: PageData = {
  events: [],
  posts: [],
  reviews: [],
  eventsPage: null,
  aboutPage: null,
  partnershipsPage: null,
  blogPage: null,
};

// `read` loads another page's content: cached for the public site, fresh for
// the admin
export async function loadPageData(
  key: PageKey,
  read: (key: PageKey) => Promise<PageView>,
): Promise<PageData> {
  switch (key) {
    case "home": {
      const [
        events,
        posts,
        reviews,
        eventsPage,
        aboutPage,
        partnershipsPage,
        blogPage,
      ] = await Promise.all([
        getUpcomingEvents(),
        getRecentPosts(),
        getRecentLetterboxdReviews(),
        read("events"),
        read("about"),
        read("partnerships"),
        read("blog"),
      ]);
      return {
        events,
        posts,
        reviews,
        eventsPage,
        aboutPage,
        partnershipsPage,
        blogPage,
      };
    }
    case "events":
      return { ...EMPTY, events: await getUpcomingEvents() };
    case "blog":
      return { ...EMPTY, posts: await getRecentPosts() };
    default:
      return EMPTY;
  }
}
