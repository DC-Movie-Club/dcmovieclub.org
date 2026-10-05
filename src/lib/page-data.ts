import "server-only";
import {
  getRecentLetterboxdReviews,
  getRecentPosts,
  getUpcomingEvents,
} from "@/lib/data";
import type { PageData } from "@/components/pages/PageBody";
import type { PageKey } from "@/config/pages";
import type { PageView } from "@/lib/pages";

const EMPTY: PageData = { events: [], posts: [], reviews: [], eventsPage: null };

// `read` loads another page's content: cached for the public site, fresh for
// the admin
export async function loadPageData(
  key: PageKey,
  read: (key: PageKey) => Promise<PageView>,
): Promise<PageData> {
  switch (key) {
    case "home": {
      const [events, reviews, eventsPage] = await Promise.all([
        getUpcomingEvents(),
        getRecentLetterboxdReviews(),
        read("events"),
      ]);
      return { ...EMPTY, events, reviews, eventsPage };
    }
    case "events":
      return { ...EMPTY, events: await getUpcomingEvents() };
    case "blog":
      return { ...EMPTY, posts: await getRecentPosts() };
    default:
      return EMPTY;
  }
}
