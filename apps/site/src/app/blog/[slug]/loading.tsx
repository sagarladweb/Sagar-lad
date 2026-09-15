"use client";

export default function BlogSlugLoading() {
  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12">
        <div className="space-y-6">
          {/* Back button + author card skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="sk-item h-4 w-36" />
            <div className="flex items-center gap-2.5 self-center sm:self-auto">
              <div className="sk-item sk-circle h-8 w-8" />
              <div className="sk-item h-3 w-28" />
            </div>
          </div>
          <div className="sk-item h-6 w-20" />
          <div className="sk-item h-10 sm:h-12 w-3/4 mx-auto lg:mx-0" />
          <div className="sk-item h-5 w-2/3 mx-auto lg:mx-0" />
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="sk-item sk-circle h-10 w-10" />
            <div className="space-y-1.5">
              <div className="sk-item h-3.5 w-24" />
              <div className="sk-item h-3 w-32" />
            </div>
          </div>
          <div className="sk-item sk-full aspect-video w-full" />
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="sk-item h-3.5 w-full" />
                <div className="sk-item h-3.5 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
