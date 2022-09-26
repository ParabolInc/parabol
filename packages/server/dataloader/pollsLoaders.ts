import DataLoader from 'dataloader'
import {IGetPollOptionsByPollIdsQueryResult} from '../postgres/queries/generated/getPollOptionsByPollIdsQuery'
import {IGetPollsByDiscussionIdsQueryResult} from '../postgres/queries/generated/getPollsByDiscussionIdsQuery'
import {IGetPollsByIdsQueryResult} from '../postgres/queries/generated/getPollsByIdsQuery'
import getPollOptionsByPollIds from '../postgres/queries/getPollOptionsByPollIds'
import getPollsByDiscussionIds from '../postgres/queries/getPollsByDiscussionIds'
import getPollsByIds from '../postgres/queries/getPollsByIds'
import RootDataLoader from './RootDataLoader'

export const pollOptions = (parent: RootDataLoader) => {
  return new DataLoader<number, IGetPollOptionsByPollIdsQueryResult[], string>(
    async (pollIds) => {
      const rows = await getPollOptionsByPollIds(pollIds)
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
      const rows = await getPollsByIds(pollIds)
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
      const rows = await getPollsByDiscussionIds(discussionIds)
      return discussionIds.map((discussionId) =>
        rows.filter((row) => row.discussionId === discussionId)
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
