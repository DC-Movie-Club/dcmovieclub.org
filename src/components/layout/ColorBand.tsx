import { colorVars, type PageColors } from "@/config/pages";
import { Container } from "@/components/layout/Container";

// A full-width band in another page's colors, as on the home page, where each
// band previews a page. Its content is a column.
export function ColorBand({
  colors,
  children,
}: {
  colors: PageColors;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-page-bg pt-16 pb-14" style={colorVars(colors)}>
      <Container className="flex flex-col gap-10">{children}</Container>
    </section>
  );
}
