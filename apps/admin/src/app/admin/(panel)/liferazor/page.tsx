import { LifeRazorManager } from "@/components/admin/LifeRazorManager";

export const dynamic = "force-dynamic";

export default function LifeRazorAdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Life Razor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the &ldquo;Current Life Razor&rdquo; section displayed on the homepage.
        </p>
      </header>
      <LifeRazorManager />
    </div>
  );
}
