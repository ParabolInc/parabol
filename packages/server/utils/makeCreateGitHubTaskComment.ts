import {ExternalLinks} from '../../client/types/constEnums'

const makeCreateGitHubTaskComment = (
  creator: string,
  assignee: string,
  teamName: string,
  teamDashboardUrl: string
) => {
  const sanitizedCreator = creator.replace(/#(\d+)/g, '#​\u200b$1')
  const sanitizedAssignee = assignee.replace(/#(\d+)/g, '#​\u200b$1')

  return `Created by ${sanitizedCreator} for ${sanitizedAssignee}
  See the dashboard of [${teamName}](${teamDashboardUrl})

  *Powered by [Parabol](${ExternalLinks.INTEGRATIONS_GITHUB})*`
}

export default makeCreateGitHubTaskComment
