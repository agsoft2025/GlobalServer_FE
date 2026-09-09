// Client-side PREVIEW ONLY. The final SMS is always assembled on the backend
// (SchoolServer_BE) from the approved text + validated values. This helper just
// substitutes sample/entered values into the {#...#} slots so the Super Admin
// can see the shape of the message. Never send this string anywhere.
const DLT_TOKEN = /\{#\s*[A-Za-z0-9_]+\s*#\}/g;

export const countPlaceholders = (approvedText: string): number =>
  (approvedText.match(DLT_TOKEN) || []).length;

export const buildPreview = (approvedText: string, values: string[]): string => {
  let i = 0;
  return approvedText.replace(DLT_TOKEN, () => {
    const v = (values[i] ?? "").trim();
    i += 1;
    return v || "____";
  });
};
