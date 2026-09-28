"use client";

import { useState } from "react";
import { Loader2, KeyRound, Mail } from "lucide-react";
import { showToast } from "@/components/admin/Toast";
import {
  Field,
  PasswordInput,
  TileHeader,
  inputCls,
  btnCls,
} from "@/components/admin/ProfileForm";

export function PasswordCard() {
  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", undefined, "error");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", currentPassword: curPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not change password");
      showToast("Password changed");
      setCurPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast("Password change failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card card-grad p-6">
      <TileHeader
        icon={KeyRound}
        title="Change password"
        subtitle="At least 8 characters with letters and numbers."
      />
      <div className="mt-5 space-y-4">
        <Field label="Current password">
          <PasswordInput
            value={curPassword}
            onChange={setCurPassword}
            autoComplete="current-password"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password">
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div className="flex items-center justify-end">
          <button type="button" onClick={changePassword} disabled={changingPassword} className={btnCls}>
            {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Change password
          </button>
        </div>
      </div>
    </section>
  );
}

export function EmailCard({ currentEmail }: { currentEmail?: string | null }) {
  const [curPasswordEmail, setCurPasswordEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  async function changeEmail() {
    setChangingEmail(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "email", currentPassword: curPasswordEmail, newEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not change email");
      showToast("Email changed. Use your new email next time you sign in.");
      setCurPasswordEmail("");
      setNewEmail("");
    } catch (err) {
      showToast("Email change failed", err instanceof Error ? err.message : undefined, "error");
    } finally {
      setChangingEmail(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card card-grad p-6">
      <TileHeader
        icon={Mail}
        title="Sign-in email"
        subtitle={`Current email: ${currentEmail ?? "—"}`}
      />
      <div className="mt-5 space-y-4">
        <Field label="Current password">
          <PasswordInput
            value={curPasswordEmail}
            onChange={setCurPasswordEmail}
            autoComplete="current-password"
          />
        </Field>
        <Field label="New email">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className={inputCls}
            autoComplete="email"
          />
        </Field>
        <div className="flex items-center justify-end">
          <button type="button" onClick={changeEmail} disabled={changingEmail} className={btnCls}>
            {changingEmail && <Loader2 className="h-4 w-4 animate-spin" />} Update email
          </button>
        </div>
      </div>
    </section>
  );
}
