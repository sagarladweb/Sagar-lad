"use client";

export function NewsletterContent({ html }: { html: string }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
      <div
        className="rounded-xl border border-border bg-card p-5 sm:p-8 md:p-10 shadow-sm
          [&_h1]:font-display [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-4
          [&_h2]:font-display [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_h2]:mt-6 first:[&_h2]:mt-0
          [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mb-2
          [&_p]:text-sm [&_p]:sm:text-[15px] [&_p]:leading-relaxed [&_p]:text-foreground/80 [&_p]:mb-4 last:[&_p]:mb-0
          [&_strong]:text-foreground [&_strong]:font-semibold
          [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-brand/30 [&_a]:hover:decoration-brand
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
          [&_li]:text-sm [&_li]:sm:text-[15px] [&_li]:leading-relaxed [&_li]:text-foreground/80
          [&_blockquote]:border-l-2 [&_blockquote]:border-brand/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4
          [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-4
          [&_hr]:border-border [&_hr]:my-6
          [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:mb-4
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
