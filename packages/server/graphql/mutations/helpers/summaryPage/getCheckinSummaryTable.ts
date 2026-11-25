import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import omitPrivateTasks from '../../../../utils/omitPrivateTasks'
import {getSummaryTable} from './getSummaryTable'

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
      if (!discussion) return []
      const [tasks, comments] = await Promise.all([
        dataLoader.get('tasksByDiscussionId').load(discussion.id),
        dataLoader.get('commentsByDiscussionId').load(discussion.id)
      ])

      const allItems = [
        ...omitPrivateTasks(tasks).map((task) => ({...task, type: 'Task' as const})),
        ...comments
          .filter(({isActive}) => isActive)
          .map((comment) => ({...comment, type: 'Comment' as const}))
      ]

      const findDiscussionThread = (threadParentId: string | null) => {
        if (!threadParentId) return ''
        const foundItem = allItems.find(({id}) => id === threadParentId)
        return foundItem?.plaintextContent ?? ''
      }

      const rows = await Promise.all(
        allItems.map(async (item): Promise<Record<(typeof headers)[number], string>> => {
          const author =
            item.type === 'Comment' && item.isAnonymous
              ? 'Anonymous'
              : ((item.createdBy &&
                  (await dataLoader.get('users').load(item.createdBy))?.preferredName) ??
                '')
          return {
            Author: author,
            'Agenda Item': content ?? '<Untitled>',
            Type: item.type,
            'Created at': item.createdAt.toISOString(),
            Content: item.plaintextContent,
            'Discussion Thread': findDiscussionThread(item.threadParentId)
          }
        })
      )

      return rows
    })
  )

  return agendaItemDiscussions.flat()
}

export const getCheckinSummaryTable = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const rowData = await getCheckinRowData(meetingId, dataLoader)
  return getSummaryTable(headers, rowData)
}
