export default function plural(
  count: number,
  singularWord: string,
  pluralWord = `${singularWord}s`
) {
  return count === 1 ? singularWord : pluralWord
}
