export default function trimString(str, maxLen) {
  let trimmed = str;
  if (str.length > maxLen) {
    trimmed = `${trimmed.slice(0, maxLen).trim()}...`;
  }
  return trimmed;
}
