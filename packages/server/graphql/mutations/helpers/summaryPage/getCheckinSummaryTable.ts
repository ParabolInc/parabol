import {isNotNull} from '../../../../../client/utils/predicates'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'

const headers = [
  'Author',
  'Agenda Item',
  'Type',
  'Created at',
  'Content',
  'Discussion Thread'
] as const

const getCheckinRowData = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const [agendaItems, discussions] = await Promise.all([
    dataLoader.get('agendaItemsByMeetingId').load(meetingId),
    dataLoader.get('discussionsByMeetingId').load(meetingId)
  ])
  if (agendaItems.length === 0) return []

  const agendaItemDiscussions = await Promise.all(
    agendaItems.map(async (agendaItem) => {
      const {id, content} = agendaItem
      const discussion = discussions.find((d) => d.discussionTopicId === id)
      if (!discussion) return
      const [tasks, comments] = await Promise.all([
        dataLoader.get('tasksByDiscussionId').load(discussion.id),
        dataLoader.get('commentsByDiscussionId').load(discussion.id)
      ])

      const allItems = [
        ...tasks.map((task) => ({...task, type: 'Task'})),
        ...comments.map((comment) => ({...comment, type: 'Comment'}))
      ]

      // preload authors
      dataLoader
        .get('users')
        .loadMany(allItems.map((item) => item.createdBy).filter(Boolean) as string[])

      const findDiscussionThread = (threadParentId: string | null) => {
        if (!threadParentId) return null
        const foundItem = allItems.find(({id}) => id === threadParentId)
        return foundItem?.plaintextContent ?? null
      }

      const rows = await Promise.all(
        allItems.map(async (item): Promise<Record<(typeof headers)[number], string>> => {
          const author =
            (item.createdBy &&
              (await dataLoader.get('users').load(item.createdBy))?.preferredName) ??
            ''
          return {
            Author: author,
            'Agenda Item': content ?? '<Untitled>',
            Type: item.type,
            'Created at': item.createdAt.toISOString(),
            Content: item.plaintextContent,
            'Discussion Thread': findDiscussionThread(item.threadParentId) ?? ''
          }
        })
      )

      return rows
    })
  )

  return agendaItemDiscussions.flat().filter(isNotNull)
}

export const getCheckinSummaryTable = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const rowData = await getCheckinRowData(meetingId, dataLoader)
  return [
    {type: 'paragraph'},
    {
      type: 'details',
      attrs: {open: false},
      content: [
        {type: 'detailsSummary', content: [{type: 'text', text: 'Table View'}]},
        {
          type: 'detailsContent',
          content: [
            {
              type: 'table',
              content: [
                {
                  type: 'tableRow',
                  content: headers.map((text) => ({
                    type: 'tableHeader',
                    attrs: {colspan: 1, rowspan: 1},
                    content: [
                      {
                        type: 'paragraph',
                        content: [{type: 'text', text, marks: [{type: 'bold', attrs: {}}]}]
                      }
                    ]
                  }))
                },
                ...rowData.map((row) => ({
                  type: 'tableRow',
                  content: headers.map((columnName, idx) => {
                    const text = row[columnName]
                    return {
                      type: 'tableCell',
                      attrs: {colspan: 1, rowspan: 1},
                      content: [
                        {
                          type: 'paragraph',
                          // zero-length strings are not allowed, but we need a paragraph to keep the cell from collapsing
                          content: !text
                            ? []
                            : [
                                {
                                  type: 'text',
                                  text,
                                  marks: idx === 0 ? [{type: 'bold', attrs: {}}] : undefined
                                }
                              ]
                        }
                      ]
                    }
                  })
                }))
              ]
            }
          ]
        }
      ]
    }
  ]
}
