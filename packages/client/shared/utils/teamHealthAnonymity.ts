// Below this many respondents, a per-person fact (who answered, the spread of scores) could be
// matched back to an individual answer. Naming respondents and drawing the spread both wait for it
export const MIN_RESPONDENTS_FOR_DETAILS = 4

export const canShowRespondentDetails = (respondentCount: number) =>
  respondentCount >= MIN_RESPONDENTS_FOR_DETAILS

// Below this many respondents, a category gets no AI summary or conversation starter, since
// anything written about so few answers would point at the people who gave them
export const MIN_RESPONDENTS_FOR_SUMMARY = 3
