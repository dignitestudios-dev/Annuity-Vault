import { redirect } from "next/navigation";

export default function SettingsPage() {
  // Redirect to the first sub-route by default
  redirect("/dashboard/settings/profile");
}
