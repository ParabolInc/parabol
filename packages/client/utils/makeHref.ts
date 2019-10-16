export default function makeHref(relativeLink: string = '') {
  return `${window.location.origin}${relativeLink}`
}
