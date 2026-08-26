import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'

// Below this many respondents an aggregate is one person's answers wearing a mean: a two-person
// cycle publishes a "team average" that either respondent can solve for. The reveal is withheld
// entirely rather than dressed up as anonymous.
export const MIN_TEAM_HEALTH_RESPONDENTS = 3

// The single gate every surface that publishes aggregated answers has to pass — the result phase,
// the summary page, the summary email, the AI insights, and the trend. Ending the meeting is what
// *unlocks* the reveal; clearing this floor is what *permits* it.
export const canRevealTeamHealth = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  return new Set(responses.map(({userId}) => userId)).size >= MIN_TEAM_HEALTH_RESPONDENTS
}
