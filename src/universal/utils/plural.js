export default function plural(count, singularWord, pluralWord = `${singularWord}s`) {
  return count === 1 ? singularWord : pluralWord;
}
