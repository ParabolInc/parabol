export default function trimString(str, maxLen) {
  return str.length <= maxLen ? str : `${str.slice(0, maxLen - 3).trim()}...`;
}
