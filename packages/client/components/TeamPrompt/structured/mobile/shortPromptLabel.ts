const stripTerminal = (question: string) => question.replace(/[?.!]+$/, '')

const shortPromptLabel = (question: string, max = 12) => {
  const stripped = stripTerminal(question)
  let label = ''
  for (const word of stripped.split(/\s+/)) {
    const next = label ? `${label} ${word}` : word
    if (next.length > max) break
    label = next
  }
  if (!label) label = stripped.slice(0, max)
  return label.length < stripped.length ? `${label}…` : label
}

export default shortPromptLabel
