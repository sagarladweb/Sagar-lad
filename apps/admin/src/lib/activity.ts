// Shared labels + formatting for the admin activity feed (dashboard widget
// and /admin/activity). Single source so both stay in sync.
export const ACTIVITY_LABELS: Record<string, string> = {
  LOGIN_OK: "Signed in",
  LOGIN_FAIL: "Sign-in failed",
  LOGIN_LOCKED: "Account locked",
  LOGIN_THROTTLED: "Sign-in throttled",
  "2FA_SETUP": "Enabled 2FA",
  "2FA_DISABLE": "Disabled 2FA",
  POST_CREATE: "Created a post",
  POST_UPDATE: "Updated a post",
  POST_DELETE: "Deleted a post",
  BOOK_CREATE: "Added a book",
  BOOK_UPDATE: "Updated a book",
  BOOK_DELETE: "Deleted a book",
  VIDEO_CREATE: "Added a video",
  VIDEO_UPDATE: "Updated a video",
  VIDEO_DELETE: "Deleted a video",
  QUOTE_CREATE: "Added a quote",
  QUOTE_UPDATE: "Updated a quote",
  QUOTE_DELETE: "Deleted a quote",
  CATEGORY_CREATE: "Added a category",
  CATEGORY_DELETE: "Deleted a category",
  COMMENT_APPROVE: "Approved a comment",
  COMMENT_DELETE: "Deleted a comment",
  SUBSCRIBER_DELETE: "Removed a subscriber",
  REQUEST_DELETE: "Deleted a request",
  NEWSLETTER: "Sent a newsletter",
  EBOOK_DOWNLOAD: "E-book download",
  UPLOAD: "Uploaded a file",
  PASSWORD_CHANGE: "Changed password",
  PROFILE_UPDATE: "Updated profile",
};

export function activityLabel(action: string) {
  return ACTIVITY_LABELS[action] ?? action.toLowerCase().replace(/_/g, " ");
}

// Actions where the device name matters — the admin can see which device a
// sign-in (or failed attempt) came from.
export const DEVICE_ACTIONS = new Set([
  "LOGIN_OK",
  "LOGIN_FAIL",
  "LOGIN_LOCKED",
  "LOGIN_THROTTLED",
]);

export function timeAgo(date: Date) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
