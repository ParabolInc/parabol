// A Link builds its URL from a path, search params and a hash, so an href made at runtime is split into those parts.
// An href to another site passes through whole, which the router renders as an external link
const hrefOptions = (href: string) => {
  const url = new URL(href, window.location.origin)
  if (url.origin !== window.location.origin) return {to: href}
  return {
    to: url.pathname,
    search: Object.fromEntries(url.searchParams),
    hash: url.hash.slice(1)
  }
}

export default hrefOptions
