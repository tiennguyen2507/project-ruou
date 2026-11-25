export function formatVietnamTime(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return (
      d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) +
      " • " +
      d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    );
  } catch {
    return isoString;
  }
}
