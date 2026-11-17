import {ExternalLinks} from '../../../client/types/constEnums'

const makeScoreClickUpComment = (
  dimensionName: string,
  finalScore: string,
  meetingName: string,
  discussionURL: string
) =>
  [
    `${dimensionName}: ${finalScore}`,
    `See the discussion in ${meetingName}: ${discussionURL}`,
    `Powered by Parabol: ${ExternalLinks.GETTING_STARTED_SPRINT_POKER}`
  ].join('\n\n')

export default makeScoreClickUpComment
