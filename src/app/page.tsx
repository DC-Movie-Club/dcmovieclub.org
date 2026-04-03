import Image from "next/image";

{/* Landing page. Will feature upcoming events prominently, newsletter signup
    (embedded Substack), and a warm intro to the club. Design TBD with designer Hannah. */}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <Image
        src="/images/dcmc-logo.png"
        alt="DC Movie Club"
        width={280}
        height={280}
        priority
      />
      <p className="mt-8 text-2xl tracking-wide text-muted-foreground">
        Something great coming soon
      </p>
    </div>
  );
}
