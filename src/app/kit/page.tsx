import NextLink from "next/link";
import { pageTemplates } from "@/config/pages";
import { kitPageKeys } from "@/app/kit/fixtures";

export default function KitIndex() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl uppercase tracking-wide">Kit</h1>
      <p>Every page, drawn from made-up data.</p>
      <ul className="flex flex-col gap-2 text-lg uppercase tracking-wide">
        {kitPageKeys.map((key) => (
          <li key={key}>
            <NextLink href={`/kit/${key}`} className="underline underline-offset-4">
              {pageTemplates[key].label}
            </NextLink>
          </li>
        ))}
        <li>
          <NextLink href="/kit/404" className="underline underline-offset-4">
            404
          </NextLink>
        </li>
      </ul>
    </div>
  );
}
