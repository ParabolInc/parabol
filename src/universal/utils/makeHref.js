export default function makeMeetingUrl(relativeLink) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${relativeLink}`;
  }
  // default for SSR/error catching
  return 'https://www.parabol.co';
}
