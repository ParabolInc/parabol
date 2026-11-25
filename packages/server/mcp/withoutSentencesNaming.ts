const withoutSentencesNaming = (text: string, names: string[]) =>
  text
    .split('\n\n')
    .map((paragraph) =>
      paragraph
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !names.some((name) => sentence.includes(name)))
        .join(' ')
    )
    .filter(Boolean)
    .join('\n\n')

export default withoutSentencesNaming
