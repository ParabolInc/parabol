export const quickHash = async (ids: string[]) => {
  const data = new TextEncoder().encode(ids.join(',')) // Convert array to byte array
  const hashBuffer = await crypto.subtle.digest('SHA-256', data) // Hash using SHA-256
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // Convert buffer to array
  return hashArray
    .map((b) => b.toString(36))
    .join('')
    .substring(0, 8) // Base36 encoding + shorten
}
