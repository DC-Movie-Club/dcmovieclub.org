import { CardSurface } from "@/components/CardSurface";

export function CreamCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CardSurface />
      <div className="relative px-6 py-8 sm:px-8">{children}</div>
    </div>
  );
}
