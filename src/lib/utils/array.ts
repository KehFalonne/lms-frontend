/**
 * Remove duplicate items from an array by their `id` field.
 *
 * Some backend endpoints can return the same logical entity twice (e.g.
 * multiple CourseInstructor rows for the same offering). This makes React
 * keys stable and list rendering predictable.
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
