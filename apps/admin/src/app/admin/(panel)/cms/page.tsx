import { Suspense } from "react";
import { HomepageCMS } from "@/components/admin/cms/HomepageCMS";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CMSPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-3 text-accent" />
          Loading CMS...
        </div>
      }
    >
      <HomepageCMS />
    </Suspense>
  );
}
