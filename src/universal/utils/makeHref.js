export default function makeHref(relativeLink) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${relativeLink}`;
  }
  // default for SSR
  return 'https://www.parabol.co'
}
