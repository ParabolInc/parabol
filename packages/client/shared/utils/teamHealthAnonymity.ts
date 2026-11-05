// Below this many respondents, a per-person fact (who answered, the spread of scores) could be
// matched back to an individual answer. Naming respondents and drawing the spread both wait for it
export const MIN_RESPONDENTS_FOR_DETAILS = 4

export const canShowRespondentDetails = (respondentCount: number) =>
  respondentCount >= MIN_RESPONDENTS_FOR_DETAILS

// Below this many respondents, a category gets no AI summary or conversation starter, since
// anything written about so few answers would point at the people who gave them
export const MIN_RESPONDENTS_FOR_SUMMARY = 3

// Below this many respondents, an average sits close enough to the answers behind it to point at the people who gave
// them. A check this few people answered shows no scores anywhere, and neither does a category this few people scored
export const MIN_RESPONDENTS_FOR_SCORE = 3

export const canShowTeamHealthScore = (respondentCount: number) =>
  respondentCount >= MIN_RESPONDENTS_FOR_SCORE
