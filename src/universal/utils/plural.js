export default function plural(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
