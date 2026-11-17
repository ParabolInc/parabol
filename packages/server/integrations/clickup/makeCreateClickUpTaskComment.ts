import {ExternalLinks} from '../../../client/types/constEnums'

const makeCreateClickUpTaskComment = (
  creator: string,
  assignee: string,
  teamName: string,
  teamDashboardUrl: string
) =>
  [
    `Created by ${creator} for ${assignee}`,
    `See the dashboard of ${teamName}: ${teamDashboardUrl}`,
    `Powered by Parabol: ${ExternalLinks.INTEGRATIONS}`
  ].join('\n\n')

export default makeCreateClickUpTaskComment
