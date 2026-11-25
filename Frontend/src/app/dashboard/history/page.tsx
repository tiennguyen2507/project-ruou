import { redirect } from "next/navigation";

export default function HistoryLegacyRedirectPage() {
  redirect("/dashboard/proxy/history");
}
