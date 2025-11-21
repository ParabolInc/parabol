import DataLoader from 'dataloader'
import getKysely from '../postgres/getKysely'
import type {Poll, PollOption} from '../postgres/types'
import type RootDataLoader from './RootDataLoader'

export const pollOptions = (parent: RootDataLoader) => {
  return new DataLoader<number, PollOption[], string>(
    async (pollIds) => {
      const rows = await getKysely()
        .selectFrom('PollOption')
        .selectAll()
        .where('pollId', 'in', pollIds)
        .execute()
      return pollIds.map((pollId) => rows.filter((row) => row.pollId === pollId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const polls = (parent: RootDataLoader) => {
  return new DataLoader<number, Poll | null, string>(
    async (pollIds) => {
      const rows = await getKysely()
        .selectFrom('Poll')
        .selectAll()
        .where('id', 'in', pollIds)
        .execute()
      return pollIds.map((pollId) => rows.find((row) => row.id === pollId) || null)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const pollsByDiscussionId = (parent: RootDataLoader) => {
  return new DataLoader<string, Poll[], string>(
    async (discussionIds) => {
      const rows = await getKysely()
        .selectFrom('Poll')
        .selectAll()
        .where('discussionId', 'in', discussionIds)
        .execute()
      return discussionIds.map((discussionId) =>
        rows.filter((row) => row.discussionId === discussionId)
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
