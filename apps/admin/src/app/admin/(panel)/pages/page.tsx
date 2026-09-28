import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGaAnalytics, prettyPagePath } from "@/lib/analytics";
import { formatCompact } from "@/lib/charts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const ga = await getGaAnalytics(14).catch(() => null);
  const pages = ga?.data.topPages ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">All pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pages.length} {pages.length === 1 ? "page" : "pages"} tracked in the last 14 days
          </p>
        </div>
      </header>

      {pages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No page data yet. Connect GA_PROPERTY_ID to see traffic.
        </p>
      ) : (
        <Card>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Page</th>
                  <th className="px-5 py-3 text-right">Views</th>
                  <th className="px-5 py-3 text-right">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((p, i) => (
                  <tr key={p.path} className="hover:bg-muted/30 transition-colors duration-150">
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3">
                      <span className="block font-medium">{prettyPagePath(p.path)}</span>
                      {prettyPagePath(p.path) !== p.path && (
                        <span className="block text-xs text-muted-foreground tabular-nums">{p.path}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.pageviews)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCompact(p.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
