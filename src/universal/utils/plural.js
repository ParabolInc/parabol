export default function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
