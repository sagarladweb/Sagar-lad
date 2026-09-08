# Graph Report - demo  (2026-09-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1977 nodes · 3501 edges · 150 communities (95 shown, 30 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `66869cc0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- TipTapEditor.tsx
- PostForm.tsx
- requireAdmin
- videos/[slug]/page.tsx
- dashboard/page.tsx
- admin/src/lib/content.ts
- include
- AnnouncementForm.tsx
- Shimmer.tsx
- admin/src/lib/storage.ts
- overrides
- SITE
- BooksManager.tsx
- posts/route.ts
- site/src/lib/content.ts
- speaking/contact/page.tsx
- NewsletterComposer.tsx
- NewsletterComposer
- (panel)/layout.tsx
- auth.ts
- site/src/lib/site.ts
- dependencies
- ModerationPanel.tsx
- showToast
- site/src/app/page.tsx
- dependencies
- SettingsTabs.tsx
- admin/src/lib/newsletterTemplates.ts
- books-read/page.tsx
- prisma
- site/src/lib/newsletter.ts
- about/page.tsx
- BookCarousel.tsx
- dbSafe
- devDependencies
- ConfirmDialog.tsx
- VideosManager.tsx
- ContentHub.tsx
- download/[id]/route.ts
- compilerOptions
- compilerOptions
- validateEmail
- SiteFrame.tsx
- site/src/lib/newsletterTemplates.ts
- compilerOptions
- health/route.ts
- admin/src/lib/db.ts
- newsletterTemplateStore.ts
- blog/[slug]/page.tsx
- MindUpPillars.tsx
- Navbar.tsx
- db/package.json
- site/src/lib/social-icons.ts
- seed.ts
- devDependencies
- NewsletterTiptapEditor.tsx
- NewsletterComposeClient.tsx
- VideosManager
- MentorshipClient.tsx
- Timeline.tsx
- CarouselNav.tsx
- scripts
- dependencies
- scripts
- site/src/lib/storage.ts
- PageFlip
- AnnouncementManager.tsx
- BooksManager
- seed-engagement.ts
- index.ts
- SocialLinks.tsx
- preview/[slug]/page.tsx
- exclude
- TopicsGrid.tsx
- drafts/route.ts
- lib
- include
- socials/page.tsx
- ShareButtons.tsx
- Footer.tsx
- admin/src/app/layout.tsx
- next-auth.d.ts
- opengraph-image.tsx
- NewsletterPopup.tsx
- Dropdown
- @types/node
- typescript
- admin/src/app/api/cron/keepalive/route.ts
- SocialPicker
- api/categories/route.ts
- api/socials/route.ts
- start-site.sh
- site/vercel.json
- react-dom
- @sagarlad/db
- @tailwindcss/postcss
- @types/react
- (panel)/books/page.tsx
- (panel)/videos/page.tsx
- middleware.ts
- start-admin.sh
- admin/vercel.json
- api/announcements/route.ts
- not-found.tsx
- DevImageTuner.tsx
- admin/eslint.config.mjs
- admin/next.config.ts
- next-auth
- otplib
- prosemirror-model
- @tiptap/extension-bubble-menu
- @tiptap/extension-character-count
- @tiptap/extension-dropcursor
- @tiptap/extension-gapcursor
- @tiptap/extension-placeholder
- @tiptap/extension-text-style
- @tiptap/extension-typography
- @tiptap/extension-underline
- @tiptap/react
- @tiptap/suggestion
- admin/postcss.config.mjs
- site/eslint.config.mjs
- site/next.config.ts
- site/postcss.config.mjs
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `requireAdmin()` - 75 edges
2. `prisma` - 59 edges
3. `include` - 51 edges
4. `dbSafe()` - 45 edges
5. `showToast()` - 42 edges
6. `NewsletterComposer()` - 41 edges
7. `revalidatePublic()` - 34 edges
8. `SITE` - 28 edges
9. `JsonLd()` - 22 edges
10. `pageMetadata()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `getPublishedBooks()` --calls--> `dbSafe()`  [EXTRACTED]
  apps/site/src/lib/content.ts → packages/db/src/index.ts
- `POST()` --calls--> `dbSafe()`  [EXTRACTED]
  apps/site/src/app/api/comments/route.ts → packages/db/src/index.ts
- `GET()` --calls--> `dbSafe()`  [EXTRACTED]
  apps/site/src/app/api/cron/keepalive/route.ts → packages/db/src/index.ts
- `GET()` --calls--> `dbSafe()`  [EXTRACTED]
  apps/site/src/app/api/comments/route.ts → packages/db/src/index.ts
- `GET()` --calls--> `dbSafe()`  [EXTRACTED]
  apps/site/src/app/api/videos/route.ts → packages/db/src/index.ts

## Import Cycles
- None detected.

## Communities (150 total, 30 thin omitted)

### Community 0 - "TipTapEditor.tsx"
Cohesion: 0.06
Nodes (45): GET(), runtime, ContentEmbed, EmbedData, EmbedKind, KINDS, BookRow, EmbedPicker() (+37 more)

### Community 1 - "PostForm.tsx"
Cohesion: 0.05
Nodes (39): dynamic, getCategories(), NewPostPage(), dynamic, Category, LazyTipTapEditor, PostForm(), clearDraft() (+31 more)

### Community 2 - "requireAdmin"
Cohesion: 0.08
Nodes (46): DELETE(), fullSchema, GET(), POST(), runtime, toggleSchema, bookSchema, DELETE() (+38 more)

### Community 3 - "videos/[slug]/page.tsx"
Cohesion: 0.07
Nodes (42): memberships, metadata, processSteps, revalidate, dynamicParams, generateMetadata(), revalidate, VideoArticlePage() (+34 more)

### Community 4 - "dashboard/page.tsx"
Cohesion: 0.06
Nodes (42): ACTIVITY_LABELS, activityLabel(), DashboardPage(), dynamic, timeAgo(), GET(), runtime, HoverCard() (+34 more)

### Community 5 - "admin/src/lib/content.ts"
Cohesion: 0.06
Nodes (34): AdminLogin(), adminMessage(), onCredentialsSubmit(), onOtpSubmit(), submit(), AdminLoginPage(), ContentAdminPage(), dynamic (+26 more)

### Community 6 - "include"
Cohesion: 0.04
Nodes (48): include, **/*.mts, **/*.ts, **/*.tsx, .builds/20260818-125722/types/**/*.ts, .builds/20260818-130758/types/**/*.ts, .builds/20260818-133037/types/**/*.ts, .builds/20260818-134857/types/**/*.ts (+40 more)

### Community 7 - "AnnouncementForm.tsx"
Cohesion: 0.06
Nodes (29): dynamic, metadata, Props, metadata, Announcement, AnnouncementForm(), handleSave(), AnnouncementFormProps (+21 more)

### Community 8 - "Shimmer.tsx"
Cohesion: 0.09
Nodes (6): Shimmer(), ShimmerCard(), ShimmerCircle(), ShimmerImage(), SkeletonCardGrid(), SkeletonHeader()

### Community 9 - "admin/src/lib/storage.ts"
Cohesion: 0.09
Nodes (34): ALLOWED_HOSTS, amazonAsin(), GET(), isAllowedUrl(), isPrivateHost(), meta(), runtime, ALLOWED (+26 more)

### Community 10 - "overrides"
Cohesion: 0.05
Nodes (39): @dietrichgebert/ponytail, dependencies, @dietrichgebert/ponytail, name, overrides, @tiptap/core, @tiptap/extension-bubble-menu, @tiptap/extension-character-count (+31 more)

### Community 11 - "SITE"
Cohesion: 0.09
Nodes (24): metadata, AnnouncementPage(), formatDate(), revalidate, metadata, revalidate, EbooksPage(), metadata (+16 more)

### Community 12 - "BooksManager.tsx"
Cohesion: 0.09
Nodes (24): Book, BookForm, BookType, empty, TABS, Category, CategoryItem, PostItem (+16 more)

### Community 13 - "posts/route.ts"
Cohesion: 0.08
Nodes (30): campaignSchema, DELETE(), GET(), POST(), runtime, POST(), runtime, testSchema (+22 more)

### Community 14 - "site/src/lib/content.ts"
Cohesion: 0.09
Nodes (32): BlogPage(), metadata, revalidate, Tab, ContentPage(), beVietnamPro, greatVibes, metadata (+24 more)

### Community 15 - "speaking/contact/page.tsx"
Cohesion: 0.09
Nodes (25): bullets, ContactPage(), onSubmit(), Errors, initial, Errors, initial, SpeakingContactPage() (+17 more)

### Community 16 - "NewsletterComposer.tsx"
Cohesion: 0.07
Nodes (18): InsertContentPicker(), InsertItem, InsertKind, KIND_META, Props, BLOCKS, BlogEditor(), BookEditor() (+10 more)

### Community 17 - "NewsletterComposer"
Cohesion: 0.08
Nodes (15): NewsletterComposer(), addInserted(), clearLocalSave(), clearSelection(), duplicateSection(), handleClear(), handleDropZoneDrop(), handleLoadLayout() (+7 more)

### Community 18 - "(panel)/layout.tsx"
Cohesion: 0.11
Nodes (20): dynamic, nav, AdminSidebar(), ICONS, NavItem, CommunityBadge(), icons, MobileNav() (+12 more)

### Community 19 - "auth.ts"
Cohesion: 0.12
Nodes (26): actionSchema, GET(), POST(), runtime, AccountLockedError, credentialsSchema, DatabaseUnavailableError, getEnvAdminHash() (+18 more)

### Community 20 - "site/src/lib/site.ts"
Cohesion: 0.11
Nodes (21): metadata, PrivacyPage(), metadata, BlogCard(), dailyBonus(), Post, Comment, CommentsSection() (+13 more)

### Community 21 - "dependencies"
Cohesion: 0.07
Nodes (31): dependencies, @google-analytics/data, jsdom, next, qrcode, react, react-icons, sharp (+23 more)

### Community 22 - "ModerationPanel.tsx"
Cohesion: 0.10
Nodes (22): Comment, Data, download(), Enquiry, ModerationPanel(), act(), exportCommentsCsv(), exportSubscribersCsv() (+14 more)

### Community 23 - "showToast"
Cohesion: 0.11
Nodes (18): initials(), ProfileForm(), changeEmail(), changePassword(), handleAvatar(), handlePasteImage(), saveProfile(), Props (+10 more)

### Community 24 - "site/src/app/page.tsx"
Cohesion: 0.12
Nodes (16): revalidate, AnnouncementData, AnnouncementPopup(), AnnouncementData, AnnouncementSection(), formatDate(), BlogPreview(), FeaturedPost (+8 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dompurify, lucide-react, @supabase/supabase-js, dependencies, dompurify, gsap, jsdom, lucide-react (+18 more)

### Community 26 - "SettingsTabs.tsx"
Cohesion: 0.10
Nodes (19): dynamic, metadata, getStoredTestEmail(), NewsletterSettings(), handleSave(), storeTestEmail(), SessionUser, SettingsTabs() (+11 more)

### Community 27 - "admin/src/lib/newsletterTemplates.ts"
Cohesion: 0.19
Nodes (24): accentForeground(), BRAND_ACCENTS, BUILDERS, dateLabel(), defaultNewsletter, editorialBody(), emptyNewsletter, esc() (+16 more)

### Community 28 - "books-read/page.tsx"
Cohesion: 0.11
Nodes (19): GET(), runtime, BooksPage(), metadata, revalidate, BooksReadPage(), FALLBACK_READ_BOOKS, metadata (+11 more)

### Community 29 - "prisma"
Cohesion: 0.21
Nodes (17): POST(), runtime, stripTags(), POST(), runtime, POST(), runtime, POST() (+9 more)

### Community 30 - "site/src/lib/newsletter.ts"
Cohesion: 0.13
Nodes (17): GET(), runtime, drain(), dynamic, GET, POST, runtime, PATHS (+9 more)

### Community 31 - "about/page.tsx"
Cohesion: 0.13
Nodes (13): pageNav, stats, metrics, AboutMe(), stats, BookStats(), formatCount(), Stat (+5 more)

### Community 32 - "BookCarousel.tsx"
Cohesion: 0.15
Nodes (17): azurePages(), BOOK_META, BookId, mindupPages(), PageData, BookViewerInner(), FlipInstance, PAGE_FLIP_CONFIG (+9 more)

### Community 33 - "dbSafe"
Cohesion: 0.14
Nodes (16): GET(), dynamic, GET(), runtime, ContentCategoryPage(), generateMetadata(), revalidate, dynamic (+8 more)

### Community 34 - "devDependencies"
Cohesion: 0.13
Nodes (19): devDependencies, eslint, eslint-config-next, tailwindcss, @types/jsdom, @types/qrcode, @types/react-dom, devDependencies (+11 more)

### Community 35 - "ConfirmDialog.tsx"
Cohesion: 0.13
Nodes (16): dynamic, getPosts(), PostsPage(), Campaign, CampaignList(), handleDelete(), ConfirmContainer(), ConfirmOptions (+8 more)

### Community 36 - "VideosManager.tsx"
Cohesion: 0.13
Nodes (14): ImageUpload(), Props, CategoryOption, empty, LAYOUTS, URL_HINTS, Video, VideoForm (+6 more)

### Community 37 - "ContentHub.tsx"
Cohesion: 0.15
Nodes (12): ContentHub(), isTab(), Tab, TABS, ContentManager(), load(), remove(), save() (+4 more)

### Community 38 - "download/[id]/route.ts"
Cohesion: 0.17
Nodes (13): EXT_BY_TYPE, isSafeUrl(), iteratorToStream(), POST(), runtime, upstreamToIterator(), AuditAction, logAudit() (+5 more)

### Community 39 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleResolution, noEmit, resolveJsonModule (+7 more)

### Community 40 - "compilerOptions"
Cohesion: 0.13
Nodes (15): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, module, moduleResolution (+7 more)

### Community 41 - "validateEmail"
Cohesion: 0.17
Nodes (9): metadata, revalidate, SubscribeModal(), onSubmit(), NewsletterForm(), onSubmit(), NewsletterSignup(), onSubmit() (+1 more)

### Community 42 - "SiteFrame.tsx"
Cohesion: 0.18
Nodes (8): AnnouncementBar(), AnnouncementBarProps, GoogleAnalytics(), ScrollAnimations(), RssBanner(), AnnouncementBarData, ScrollAnimations, ScrollTopButton()

### Community 43 - "site/src/lib/newsletterTemplates.ts"
Cohesion: 0.28
Nodes (13): BUILDERS, dateLabel(), editorialBody(), emailShell(), emptyNewsletter, esc(), letterBody(), minimalBody() (+5 more)

### Community 44 - "compilerOptions"
Cohesion: 0.13
Nodes (15): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, module, moduleResolution (+7 more)

### Community 45 - "health/route.ts"
Cohesion: 0.23
Nodes (12): checkBrevo(), checkDatabase(), checkEnvironment(), checkGoogleAnalytics(), checkSharedDatabase(), checkSiteConnectivity(), checkSupabaseStorage(), GET() (+4 more)

### Community 46 - "admin/src/lib/db.ts"
Cohesion: 0.23
Nodes (10): DELETE(), deleteSubscriber(), GET(), POST(), runtime, bodySchema, PATCH(), runtime (+2 more)

### Community 47 - "newsletterTemplateStore.ts"
Cohesion: 0.29
Nodes (13): handleDeleteTemplate(), handleSaveAsTemplate(), refreshTemplates(), deleteTemplate(), exportTemplates(), getTemplate(), getTemplates(), importTemplates() (+5 more)

### Community 48 - "blog/[slug]/page.tsx"
Cohesion: 0.22
Nodes (11): generateMetadata(), generateStaticParams(), getAllPostSlugs, PostPage(), Props, revalidate, ReadingProgress(), ViewTracker() (+3 more)

### Community 49 - "MindUpPillars.tsx"
Cohesion: 0.24
Nodes (11): MindUp(), MindUpPillars(), PILLAR_ICONS, PillarRing(), polar(), RingProps, sectorPath(), traceArc() (+3 more)

### Community 50 - "Navbar.tsx"
Cohesion: 0.14
Nodes (7): ApiBook, HEADER_SOCIALS, HeaderSocialsProps, Navbar(), NavBook, NavLinkProps, SOCIAL_ICONS

### Community 51 - "db/package.json"
Cohesion: 0.14
Nodes (13): main, name, private, scripts, build, db:generate, db:migrate, db:push (+5 more)

### Community 52 - "site/src/lib/social-icons.ts"
Cohesion: 0.28
Nodes (11): FaFacebookF(), FaInstagram(), FaLinkedinIn(), FaMedium(), FaPodcast(), FaRedditAlien(), FaTelegram(), FaXTwitter() (+3 more)

### Community 53 - "seed.ts"
Cohesion: 0.15
Nodes (9): adapter, BOOKS, POSTS, prisma, READ_BOOKS, READ_COVERS, SOCIAL_LINKS, { user, password, host, port, database } (+1 more)

### Community 54 - "devDependencies"
Cohesion: 0.17
Nodes (12): bcryptjs, bcryptjs, dotenv, devDependencies, bcryptjs, dotenv, prisma, tsx (+4 more)

### Community 55 - "NewsletterTiptapEditor.tsx"
Cohesion: 0.24
Nodes (7): showPrompt(), handleRenameTemplate(), NewsletterTiptapEditor(), NewsletterTiptapEditorProps, SLASH_COMMANDS, SlashCommand, SlashCommandMenu()

### Community 56 - "NewsletterComposeClient.tsx"
Cohesion: 0.18
Nodes (5): dirtyRef, NewsletterComposeClient(), Props, readLocalSave(), SavedState

### Community 57 - "VideosManager"
Cohesion: 0.23
Nodes (10): slugify(), VideosManager(), fetchFromUrl(), handlePastedImage(), load(), onEmbedUrlChange(), platformOf(), remove() (+2 more)

### Community 58 - "MentorshipClient.tsx"
Cohesion: 0.17
Nodes (6): AVATAR_COLORS, FAQS, MentorshipClient(), PILLARS, TESTIMONIALS_ROW1, TESTIMONIALS_ROW2

### Community 59 - "Timeline.tsx"
Cohesion: 0.35
Nodes (11): buildProgress(), buildWave(), cardTop(), dotAbove, dotX(), dotY(), MAX_CARD_BOTTOM, Node (+3 more)

### Community 60 - "CarouselNav.tsx"
Cohesion: 0.20
Nodes (7): photos, SagarGallery(), GalleryCarousel(), images, ArrowNavProps, DotPagination(), DotPaginationProps

### Community 61 - "scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, start (+2 more)

### Community 62 - "dependencies"
Cohesion: 0.18
Nodes (11): @prisma/adapter-pg, @prisma/client, @prisma/adapter-pg, @prisma/client, @prisma/adapter-pg, @prisma/client, dependencies, pg (+3 more)

### Community 63 - "scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, start (+2 more)

### Community 64 - "site/src/lib/storage.ts"
Cohesion: 0.33
Nodes (10): downloadEbook(), downloadToSupabase(), EBOOK_MIME_TYPES, ensureBucket(), ensureEbookBucket(), getClient(), optimizeImage(), publicUrl() (+2 more)

### Community 65 - "PageFlip"
Cohesion: 0.18
Nodes (3): page-flip, PageFlip, PageFlipInstance

### Community 66 - "AnnouncementManager.tsx"
Cohesion: 0.24
Nodes (7): dynamic, metadata, Announcement, AnnouncementManager(), handleDelete(), toggleActive(), formatDate()

### Community 67 - "BooksManager"
Cohesion: 0.22
Nodes (7): BooksManager(), handlePastedImage(), handleUploadEbook(), importFromLink(), load(), remove(), save()

### Community 68 - "seed-engagement.ts"
Cohesion: 0.27
Nodes (8): adapter, CATEGORY_WEIGHT, computeEngagement(), fnv1a(), main(), prisma, seededRandom(), { user, password, host, port, database }

### Community 69 - "index.ts"
Cohesion: 0.27
Nodes (9): CONNECTION_ERROR_CODES, createClient(), createPool(), getClient(), getPool(), globalForPrisma, isConnectionError(), markDbUp() (+1 more)

### Community 70 - "SocialLinks.tsx"
Cohesion: 0.28
Nodes (6): Social, SocialLinks(), Social, SocialsGrid(), IconType, socialIcon()

### Community 71 - "preview/[slug]/page.tsx"
Cohesion: 0.32
Nodes (6): dynamic, metadata, PreviewPage(), Props, ReadingProgress(), getPostBySlug

### Community 72 - "exclude"
Cohesion: 0.36
Nodes (6): exclude, exclude, .builds, .next-test-dev, .next-verify, node_modules

### Community 73 - "TopicsGrid.tsx"
Cohesion: 0.29
Nodes (6): COACH_TOPICS, ICONS, SORT_ORDER, sortTopics(), Topic, TopicsGrid()

### Community 74 - "drafts/route.ts"
Cohesion: 0.33
Nodes (6): DELETE(), draftSchema, POST(), runtime, buildTemplateBody(), NewsletterContent

### Community 75 - "lib"
Cohesion: 0.29
Nodes (7): lib, dom, esnext, lib, dom, dom.iterable, esnext

### Community 76 - "include"
Cohesion: 0.29
Nodes (7): include, **/*.mts, **/*.ts, **/*.tsx, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts

### Community 77 - "socials/page.tsx"
Cohesion: 0.38
Nodes (5): metadata, revalidate, SocialsPage(), getSiteSocials, SocialLink

### Community 79 - "Footer.tsx"
Cohesion: 0.33
Nodes (6): Footer(), FOOTER_SOCIAL_KEYS, footerCols, LEGAL_LINKS, sortSocials(), SOCIAL_ICONS

### Community 80 - "admin/src/app/layout.tsx"
Cohesion: 0.33
Nodes (4): beVietnamPro, greatVibes, metadata, rethinkSans

### Community 81 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 82 - "opengraph-image.tsx"
Cohesion: 0.33
Nodes (4): alt, contentType, runtime, size

### Community 83 - "NewsletterPopup.tsx"
Cohesion: 0.33
Nodes (3): NewsletterPopup(), onSubmit(), NewsletterPopup

### Community 84 - "Dropdown"
Cohesion: 0.47
Nodes (5): Dropdown(), choose(), onTriggerKeyDown(), openList(), DropdownOption

### Community 85 - "@types/node"
Cohesion: 0.50
Nodes (4): @types/node, @types/node, @types/node, @types/node

### Community 86 - "typescript"
Cohesion: 0.50
Nodes (4): typescript, typescript, typescript, typescript

### Community 87 - "admin/src/app/api/cron/keepalive/route.ts"
Cohesion: 0.67
Nodes (3): constantTimeCompare(), GET(), runtime

### Community 89 - "api/categories/route.ts"
Cohesion: 0.67
Nodes (3): GET(), getCategories, runtime

### Community 90 - "api/socials/route.ts"
Cohesion: 0.67
Nodes (3): GET(), getSocials, runtime

### Community 91 - "start-site.sh"
Cohesion: 0.50
Nodes (3): NEXT_DIST_DIR, PATH, start-site.sh script

### Community 92 - "site/vercel.json"
Cohesion: 0.50
Nodes (3): crons, framework, $schema

### Community 93 - "react-dom"
Cohesion: 0.67
Nodes (3): react-dom, react-dom, react-dom

### Community 94 - "@sagarlad/db"
Cohesion: 0.67
Nodes (3): @sagarlad/db, @sagarlad/db, @sagarlad/db

### Community 95 - "@tailwindcss/postcss"
Cohesion: 0.67
Nodes (3): @tailwindcss/postcss, @tailwindcss/postcss, @tailwindcss/postcss

### Community 96 - "@types/react"
Cohesion: 0.67
Nodes (3): @types/react, @types/react, @types/react

## Knowledge Gaps
- **620 isolated node(s):** `BookRow`, `Row`, `SocialRow`, `Tab`, `VideoRow` (+615 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 869 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `prisma` to `PostForm.tsx`, `requireAdmin`, `dashboard/page.tsx`, `admin/src/lib/content.ts`, `AnnouncementForm.tsx`, `SITE`, `posts/route.ts`, `site/src/lib/content.ts`, `auth.ts`, `site/src/app/page.tsx`, `site/src/lib/newsletter.ts`, `dbSafe`, `ConfirmDialog.tsx`, `download/[id]/route.ts`, `health/route.ts`, `admin/src/lib/db.ts`, `blog/[slug]/page.tsx`, `index.ts`, `drafts/route.ts`, `socials/page.tsx`, `admin/src/app/api/cron/keepalive/route.ts`, `api/categories/route.ts`, `api/socials/route.ts`, `api/announcements/route.ts`?**
  _High betweenness centrality (0.276) - this node is a cross-community bridge._
- **Why does `showToast()` connect `showToast` to `PostForm.tsx`, `AnnouncementManager.tsx`, `BooksManager`, `ConfirmDialog.tsx`, `ContentHub.tsx`, `VideosManager.tsx`, `AnnouncementForm.tsx`, `BooksManager.tsx`, `ModerationPanel.tsx`, `VideosManager`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `dbSafe()` connect `dbSafe` to `videos/[slug]/page.tsx`, `dashboard/page.tsx`, `admin/src/lib/content.ts`, `download/[id]/route.ts`, `index.ts`, `health/route.ts`, `admin/src/lib/db.ts`, `site/src/lib/content.ts`, `blog/[slug]/page.tsx`, `auth.ts`, `books-read/page.tsx`, `prisma`, `site/src/lib/newsletter.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `BookRow`, `Row`, `SocialRow` to the rest of the system?**
  _620 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `TipTapEditor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05632360471070148 - nodes in this community are weakly interconnected._
- **Should `PostForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0544464609800363 - nodes in this community are weakly interconnected._
- **Should `requireAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.07683000604960677 - nodes in this community are weakly interconnected._