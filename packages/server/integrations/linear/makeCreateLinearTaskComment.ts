import {ExternalLinks} from '../../../client/types/constEnums'

const makeCreateLinearTaskComment = (
  creator: string,
  assignee: string,
  teamName: string,
  teamDashboardUrl: string
): string => {
  const sanitizedCreator = creator.replace(/#(\d+)/g, '#\u200b$1')
  const sanitizedAssignee = assignee.replace(/#(\d+)/g, '#\u200b$1')

  return `Created by ${sanitizedCreator} for ${sanitizedAssignee}\n\nSee the dashboard of [${teamName}](${teamDashboardUrl})\n\n*Powered by [Parabol](${ExternalLinks.INTEGRATIONS_LINEAR})*`
}

export default makeCreateLinearTaskComment
