export const toSlug = (title: string) => {
  return title
    .toLowerCase() // Convert to lowercase
    .trim() // Trim spaces from the ends
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .slice(0, 100)
}
