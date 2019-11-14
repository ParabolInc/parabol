export default function makeHref(relativeLink = '') {
  return `${window.location.origin}${relativeLink}`
}
