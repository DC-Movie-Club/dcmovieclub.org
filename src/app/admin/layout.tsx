export const metadata = {
  title: "Admin | DC Movie Club",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans min-h-screen bg-background text-foreground antialiased">
      {children}
    </div>
  );
}
