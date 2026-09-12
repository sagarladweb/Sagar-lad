-- Supabase pg_cron: Publish scheduled posts every 30 minutes
-- Run this ONCE in the Supabase SQL Editor to set up the cron job.
-- Lightweight: single UPDATE with indexed WHERE, no joins, no full scans.

-- 1. Enable pg_cron (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the publish function (idempotent)
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "Post"
  SET
    "published" = true,
    "publishedAt" = now(),
    "scheduledAt" = null
  WHERE "published" = false
    AND "scheduledAt" IS NOT NULL
    AND "scheduledAt" <= now()
    AND "deletedAt" IS null;
END;
$$;

-- 3. Schedule every 30 minutes (replaces any existing schedule)
SELECT cron.unschedule('publish-scheduled-posts');

SELECT cron.schedule(
  'publish-scheduled-posts',
  '*/30 * * * *',
  $$SELECT publish_scheduled_posts()$$
);
