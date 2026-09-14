import { redirect } from "next/navigation";

export default function LifeRazorAdminPage() {
  redirect("/admin/cms?tab=liferazor");
}
