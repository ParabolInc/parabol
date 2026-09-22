// Below this many respondents, a per-person fact (who answered, the spread of scores) could be
// matched back to an individual answer. Naming respondents and drawing the spread both wait for it
export const MIN_ANONYMOUS_RESPONDENTS = 4

export const isAnonymousRespondentCount = (respondentCount: number) =>
  respondentCount >= MIN_ANONYMOUS_RESPONDENTS
