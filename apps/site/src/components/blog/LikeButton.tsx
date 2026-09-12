"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Heart } from "lucide-react";

function getClientToken(): string {
  if (typeof window === "undefined") return "";
  const key = "blog_client_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    localStorage.setItem(key, token);
  }
  return token;
}

function getLikedPosts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("liked_posts");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveLikedPosts(liked: Set<string>) {
  localStorage.setItem("liked_posts", JSON.stringify([...liked]));
}

export function LikeButton({
  slug,
  initialLikes,
  size = "sm",
  showLabel = false,
}: {
  slug: string;
  initialLikes: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Use ref for latest state to avoid stale closure issues on rapid clicks
  const stateRef = useRef({ liked: false, likes: initialLikes });

  useEffect(() => {
    const stored = getLikedPosts().has(slug);
    if (stored && initialLikes === 0) {
      const likedPosts = getLikedPosts();
      likedPosts.delete(slug);
      saveLikedPosts(likedPosts);
      setLiked(false);
      stateRef.current = { liked: false, likes: initialLikes };
    } else {
      setLiked(stored);
      stateRef.current = { liked: stored, likes: initialLikes };
    }
    setHydrated(true);
  }, [slug, initialLikes]);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = { liked, likes };
  }, [liked, likes]);

  const toggle = useCallback(async () => {
    if (!hydrated) return;

    const wasLiked = stateRef.current.liked;
    const wasLikes = stateRef.current.likes;
    const newLiked = !wasLiked;
    const newLikes = newLiked ? wasLikes + 1 : Math.max(0, wasLikes - 1);

    // Optimistic update — immediate, no loading gate
    setLiked(newLiked);
    setLikes(newLikes);

    const likedPosts = getLikedPosts();
    if (newLiked) {
      likedPosts.add(slug);
    } else {
      likedPosts.delete(slug);
    }
    saveLikedPosts(likedPosts);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug: slug,
          clientToken: getClientToken(),
          action: newLiked ? "like" : "unlike",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setLiked(data.liked);
        const current = getLikedPosts();
        if (data.liked) {
          current.add(slug);
        } else {
          current.delete(slug);
        }
        saveLikedPosts(current);
      }
    } catch {
      // Revert on network error
      setLiked(wasLiked);
      setLikes(wasLikes);
      if (wasLiked) {
        likedPosts.add(slug);
      } else {
        likedPosts.delete(slug);
      }
      saveLikedPosts(likedPosts);
    }
  }, [slug, hydrated]);

  const isMedium = size === "md";
  const isLarge = size === "lg";

  if (!hydrated) {
    return (
      <div
        className={`inline-flex items-center justify-center ${
          isLarge
            ? "gap-2.5 rounded-full border px-5 py-2.5 text-sm"
            : isMedium
            ? "gap-2 rounded-full border px-4 py-2 text-sm min-h-[40px]"
            : "gap-1.5 rounded-full border px-2.5 py-1 text-[11px]"
        } border-border bg-card/80 text-muted-foreground`}
      >
        <Heart className={`${isLarge || isMedium ? "w-4 h-4" : "w-3.5 h-3.5"}`} />
        {showLabel && <span className="font-medium text-xs">Like</span>}
        <span className="font-semibold">{initialLikes.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className={`inline-flex items-center justify-center font-medium transition-transform duration-200 active:scale-95 ${
        isLarge
          ? "gap-2.5 rounded-full border px-5 py-2.5 text-sm"
          : isMedium
          ? "gap-2 rounded-full border px-4 py-2 text-sm min-h-[40px]"
          : "gap-1.5 rounded-full border px-2.5 py-1 text-[11px]"
      } border-border bg-card/80 text-muted-foreground`}
      aria-label={liked ? `Unlike (${likes})` : `Like (${likes})`}
    >
      <span className={`relative flex items-center justify-center ${isLarge ? "w-4 h-4" : isMedium ? "w-4 h-4" : "w-3.5 h-3.5"}`}>
        <Heart
          className={`w-full h-full transition-transform duration-300 ease-out ${
            liked ? "fill-red-500 text-red-500 scale-110" : ""
          }`}
        />
      </span>
      {showLabel && (
        <span className="font-medium text-xs">
          {liked ? "Liked" : "Like"}
        </span>
      )}
      <span className="font-semibold">{likes.toLocaleString()}</span>
    </button>
  );
}
