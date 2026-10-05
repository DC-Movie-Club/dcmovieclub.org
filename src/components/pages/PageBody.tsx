import { AboutPage } from "@/components/pages/AboutPage";
import { BlogPage } from "@/components/pages/BlogPage";
import { EventsPage } from "@/components/pages/EventsPage";
import { HomePage } from "@/components/pages/HomePage";
import { PartnershipsPage } from "@/components/pages/PartnershipsPage";
import type { PageView } from "@/lib/pages";
import type { CalendarEvent } from "@/types/event";
import type { LetterboxdReview } from "@/types/letterboxd";
import type { SubstackPost } from "@/types/post";

// The live data a page shows around its content. Each page only gets what it
// uses (see loadPageData); the rest stays empty.
export type PageData = {
  events: CalendarEvent[];
  posts: SubstackPost[];
  reviews: LetterboxdReview[];
  eventsPage: PageView | null;
  aboutPage: PageView | null;
  partnershipsPage: PageView | null;
};

// Renders any page from its content, for the public route and the admin preview
export function PageBody({ page, data }: { page: PageView; data: PageData }) {
  switch (page.key) {
    case "home":
      return (
        <HomePage
          page={page}
          eventsPage={data.eventsPage}
          aboutPage={data.aboutPage}
          partnershipsPage={data.partnershipsPage}
          events={data.events}
          reviews={data.reviews}
        />
      );
    case "events":
      return <EventsPage page={page} events={data.events} />;
    case "blog":
      return <BlogPage page={page} posts={data.posts} />;
    case "about":
      return <AboutPage page={page} />;
    case "partnerships":
      return <PartnershipsPage page={page} />;
  }
}
