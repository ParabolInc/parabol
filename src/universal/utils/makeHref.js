import makeSSRAppLink from 'server/utils/makeAppLink';

export default function makeHref(relativeLink) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${relativeLink}`;
  }
  // default for SSR
  return makeSSRAppLink(relativeLink);
}
