import { textStyles } from "@/components/system/textStyles";

// A heading on the page, in the page's text color, with an optional button
// (`action`) at the end of its row, which drops under it when there's no room
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const heading = <h2 className={textStyles.pageHeading}>{title}</h2>;
  if (!action) return heading;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      {heading}
      {action}
    </div>
  );
}
