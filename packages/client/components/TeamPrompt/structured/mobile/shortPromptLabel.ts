const stripTerminal = (question: string) => question.replace(/[?.!]+$/, '')

export const SHORT_LABEL_MAX = 12

const shortPromptLabel = (question: string, max = SHORT_LABEL_MAX) => {
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

const WIDENING_MAXES = [SHORT_LABEL_MAX, 20, 28, 40]

export const shortPromptLabels = (questions: readonly string[]) => {
  for (const max of WIDENING_MAXES) {
    const labels = questions.map((question) => shortPromptLabel(question, max))
    if (new Set(labels).size === labels.length) return labels
  }
  return questions.map((question) => stripTerminal(question))
}

export default shortPromptLabel
