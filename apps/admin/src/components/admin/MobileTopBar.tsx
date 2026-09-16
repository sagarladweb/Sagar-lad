"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

const FALLBACK = "/images/profile/sagar-lad-friend-mentor-casual-outdoor-1.webp";

export function MobileTopBar({
  user,
  signOutAction,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  signOutAction: () => Promise<void>;
}) {
  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14 shadow-sm">
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-border bg-muted grid place-items-center">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK;
              }}
            />
          ) : (
            <span className="font-display font-bold text-sm text-muted-foreground">
              {(user.name || "A").charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <span className="font-display font-bold text-base truncate">Sagar Lad Admin</span>
      </span>
      <div className="flex items-center gap-2">
        <Link href="https://www.sagarlad.com" target="_blank" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="View site">
          <ExternalLink className="w-4 h-4" />
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" aria-label="Sign out">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
