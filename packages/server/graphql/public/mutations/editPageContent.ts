import {GraphQLError} from 'graphql'
import {markdownToTipTap} from '../../../../client/shared/tiptap/markdownToTipTap'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {redisHocusPocus} from '../../../hocusPocus'
import {CipherId} from '../../../utils/CipherId'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const editedContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1
      },
      content: [
        {
          type: 'text',
          text: "Matt's Kimchi Recipe is for losers"
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Do 1 thing of that'
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'and another of this'
        }
      ]
    },
    {
      type: 'paragraph'
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'No no no'
                    }
                  ]
                }
              ]
            },
            {
              type: 'tableHeader',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            },
            {
              type: 'tableHeader',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            }
          ]
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'there'
                    }
                  ]
                }
              ]
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            }
          ]
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            },
            {
              type: 'tableCell',
              attrs: {
                colspan: 1,
                rowspan: 1,
                colwidth: null,
                active: null
              },
              content: [
                {
                  type: 'paragraph'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'paragraph'
    }
  ]
}
const editPageContent: MutationResolvers['editPageContent'] = async (
  _source,
  {pageId, content, format},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [dbPageId] = CipherId.fromClient(pageId)

  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) throw new GraphQLError('Invalid pageId')

  const jsonContent =
    format === 'markdown'
      ? {type: 'doc' as const, content: markdownToTipTap(content) as any[]}
      : (() => {
          try {
            return JSON.parse(JSON.stringify(editedContent))
          } catch {
            throw new GraphQLError('Invalid JSON content')
          }
        })()

  const documentName = CipherId.toClient(dbPageId, 'page')
  await redisHocusPocus.handleEvent('replacePageContent', documentName, {content: jsonContent})

  dataLoader.get('pages').clearAll()
  const updatedPage = await dataLoader.get('pages').loadNonNull(dbPageId)

  const data = {pageId: dbPageId}
  const access = await dataLoader.get('pageAccessByPageId').load(dbPageId)
  access.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'UpdatePagePayload', data, subOptions)
  })
  return {page: updatedPage}
}

export default editPageContent
