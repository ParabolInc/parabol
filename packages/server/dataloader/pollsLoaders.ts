import DataLoader from 'dataloader'
import getKysely from '../postgres/getKysely'
import type {IGetPollOptionsByPollIdsQueryResult} from '../postgres/queries/generated/getPollOptionsByPollIdsQuery'
import type {IGetPollsByDiscussionIdsQueryResult} from '../postgres/queries/generated/getPollsByDiscussionIdsQuery'
import type {IGetPollsByIdsQueryResult} from '../postgres/queries/generated/getPollsByIdsQuery'
import type RootDataLoader from './RootDataLoader'

export const pollOptions = (parent: RootDataLoader) => {
  return new DataLoader<number, IGetPollOptionsByPollIdsQueryResult[], string>(
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
  return new DataLoader<number, IGetPollsByIdsQueryResult | null, string>(
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
  return new DataLoader<string, IGetPollsByDiscussionIdsQueryResult[], string>(
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
