import {ExternalLinks} from '../../client/types/constEnums'

// wrap anything that looks like an issue in ticks so it doesn't turn into a link to that issue
const makeScoreGitHubComment = (
  dimensionName: string,
  finalScore: string,
  meetingName: string,
  discussionURL: string
) =>
  `**${dimensionName}: ${finalScore}**
  [See the discussion](${discussionURL}) in ${meetingName.replace(/#(\d+)/g, '#​\u200b$1')}

  *Powered by [Parabol](${ExternalLinks.GETTING_STARTED_SPRINT_POKER})*`

export default makeScoreGitHubComment
