export const getAnsweredSummary = (answeredCount: number, youAnswered: boolean) => {
  if (youAnswered && answeredCount <= 1)
    return 'You’ve started answering. Your answer will be cleared.'
  if (youAnswered) {
    const others = answeredCount - 1
    const who = others === 1 ? 'You and 1 other person have' : `You and ${others} others have`
    return `${who} started answering. All answers, including private drafts, will be cleared.`
  }
  if (answeredCount === 1) {
    return '1 person has started answering. Their answer, including any private draft, will be cleared.'
  }
  return `${answeredCount} people have started answering. Their answers, including private drafts, will be cleared.`
}

export const getDrawerNote = (answeredCount: number, youAnswered: boolean) => {
  const others = answeredCount - 1
  const who =
    youAnswered && others > 0
      ? `You and ${others} ${others === 1 ? 'other' : 'others'} have`
      : youAnswered
        ? 'You have'
        : answeredCount === 1
          ? '1 person has'
          : `${answeredCount} people have`
  return `${who} started answering. Switching clears answers; replies and tasks stay.`
}

export const getSwitchedMessage = (
  templateName: string,
  hadAnswers: boolean,
  isSeriesTemplate: boolean
) =>
  [
    `The template changed to ${templateName}.`,
    hadAnswers ? 'Answers were cleared.' : null,
    isSeriesTemplate ? 'Future meetings in this series will use it too.' : null
  ]
    .filter(Boolean)
    .join(' ')
