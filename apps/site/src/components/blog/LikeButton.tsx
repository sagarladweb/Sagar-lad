"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLiked(getLikedPosts().has(slug));
    setLoading(false);
  }, [slug]);

  const toggle = useCallback(async () => {
    if (loading) return;

    const wasLiked = liked;
    const newLiked = !wasLiked;
    const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);

    // Optimistic update
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
        // Sync localStorage with server truth
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
      setLikes(likes);
      if (wasLiked) {
        likedPosts.add(slug);
      } else {
        likedPosts.delete(slug);
      }
      saveLikedPosts(likedPosts);
    }
  }, [slug, likes, liked, loading]);

  const isMedium = size === "md";
  const isLarge = size === "lg";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95 ${
        isLarge
          ? "gap-2.5 rounded-full border px-5 py-2.5 text-sm"
          : isMedium
          ? "gap-2 rounded-full border px-4 py-2 text-sm min-h-[40px]"
          : "gap-1.5 rounded-full border px-2.5 py-1 text-[11px]"
      } ${
        liked
          ? "border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm"
          : "border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-border/80"
      }`}
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
