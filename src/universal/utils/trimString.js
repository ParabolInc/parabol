export default function trimString(str, maxLen) {
  return `${str.slice(0, maxLen).trim()}...`;
}
