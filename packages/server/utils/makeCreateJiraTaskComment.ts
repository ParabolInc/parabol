import {ExternalLinks} from '../../client/types/constEnums'
import {Doc} from './convertContentStateToADF'

const makeCreateJiraTaskComment = (
  creator: string,
  assignee: string,
  teamName: string,
  teamDashboardUrl: string
): Doc => ({
  version: 1 as const,
  type: 'doc' as const,
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `Created by ${creator} for ${assignee}`
        },
        {
          type: 'hardBreak'
        },
        {
          type: 'text',
          text: 'See the dashboard of '
        },
        {
          type: 'text',
          text: teamName,
          marks: [
            {
              type: 'link',
              attrs: {
                href: teamDashboardUrl
              }
            }
          ]
        },
        {
          type: 'hardBreak'
        },
        {
          type: 'text',
          text: 'Powered by ',
          marks: [
            {
              type: 'em'
            }
          ]
        },
        {
          type: 'text',
          text: 'Parabol',
          marks: [
            {
              type: 'link',
              attrs: {
                href: ExternalLinks.INTEGRATIONS_JIRA
              }
            },
            {
              type: 'em'
            }
          ]
        }
      ]
    }
  ]
})

export default makeCreateJiraTaskComment
