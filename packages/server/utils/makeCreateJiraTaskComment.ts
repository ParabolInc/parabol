import {Doc} from './convertContentStateToADF'
import {ExternalLinks} from '../../client/types/constEnums'

const makeCreateJiraTaskComment = (creator: string, assignee: string): Doc => ({
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
                href: ExternalLinks.GETTING_STARTED_SPRINT_POKER
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
