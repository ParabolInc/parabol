import {ExternalLinks} from '../../client/types/constEnums'

// wrap anything that looks like an issue in ticks so it doesn't turn into a link to that issue
const makeCreateGitHubTaskComment = (
  creator: string,
  assignee: string,
  teamName: string,
  teamDashboardUrl: string
) =>
  `Created by ${creator} for ${assignee}
  See the dashboard of [${teamName}](${teamDashboardUrl})

  *Powered by [Parabol](${ExternalLinks.INTEGRATIONS_JIRA})*`

export default makeCreateGitHubTaskComment
