// Force dynamic so /admin always renders as HTML (avoids RSC-only response)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
