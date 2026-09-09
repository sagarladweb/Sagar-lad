"use client";

import { useState, useEffect } from "react";
import type { RewardBook } from "./types";
import { DownloadModal } from "./DownloadModal";
import { Gift, ChevronLeft, ChevronRight, BookOpen, Download } from "lucide-react";

const MOBILE_PER_PAGE = 6; // 3 rows × 2 columns

export function RewardBooks() {
  const [books, setBooks] = useState<RewardBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedBook, setSelectedBook] = useState<RewardBook | null>(null);

  useEffect(() => {
    fetch("/api/mindup/ebook")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || books.length === 0) return null;

  return (
    <div className="mt-10 sm:mt-14">
      <div className="flex items-center gap-2 mb-5 sm:mb-6">
        <Gift className="w-5 h-5 text-brand" />
        <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
          Your Rewards
        </h2>
      </div>

      {/* Mobile: 2 columns, Desktop: 3 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {books
          .slice(page * MOBILE_PER_PAGE, (page + 1) * MOBILE_PER_PAGE)
          .map((book) => (
            <RewardCard key={book.id} book={book} onSelect={setSelectedBook} />
          ))}
      </div>

      {/* Pagination */}
      {books.length > MOBILE_PER_PAGE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(books.length / MOBILE_PER_PAGE)}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(Math.ceil(books.length / MOBILE_PER_PAGE) - 1, p + 1))}
        />
      )}

      {selectedBook && (
        <DownloadModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
}

function RewardCard({
  book,
  onSelect,
}: {
  book: RewardBook;
  onSelect: (book: RewardBook) => void;
}) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {book.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.imageUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
            Free Reward
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="font-medium text-sm leading-snug line-clamp-2">{book.title}</p>
        {book.tagline && (
          <p className="text-xs text-muted-foreground line-clamp-2">{book.tagline}</p>
        )}
        <button
          onClick={() => onSelect(book)}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-accent text-accent-foreground px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Prev
      </button>
      <span className="text-xs text-muted-foreground tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages - 1}
        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
