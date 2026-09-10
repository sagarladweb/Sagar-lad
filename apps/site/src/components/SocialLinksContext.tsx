"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SOCIAL_ICONS, type IconType } from "@/lib/social-icons";

export type RawSocial = {
  key: string;
  label: string;
  handle: string | null;
  href: string;
  icon: string;
  logoUrl: string | null;
  color: string | null;
};

export type EnrichedSocial = {
  key: string;
  label: string;
  handle: string | null;
  href: string;
  icon: IconType | null;
  logoUrl: string | null;
  color: string;
};

const SocialsContext = createContext<EnrichedSocial[]>([]);

export function useSocials() {
  return useContext(SocialsContext);
}

export function SocialsProvider({ children }: { children: React.ReactNode }) {
  const [socials, setSocials] = useState<EnrichedSocial[]>([]);

  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((data: { socials?: RawSocial[] }) => {
        const list: EnrichedSocial[] = [];
        for (const s of data.socials ?? []) {
          const meta = SOCIAL_ICONS[s.icon]?.icon ?? null;
          list.push({
            key: s.key,
            label: s.label,
            handle: s.handle,
            href: s.href,
            icon: meta,
            logoUrl: s.logoUrl ?? null,
            color: s.color ?? "#000000",
          });
        }
        setSocials(list);
      })
      .catch(() => {});
  }, []);

  return (
    <SocialsContext.Provider value={socials}>
      {children}
    </SocialsContext.Provider>
  );
}
