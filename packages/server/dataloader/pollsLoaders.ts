import DataLoader from 'dataloader'
import RethinkDataLoader from './RethinkDataLoader'
import getPollOptionsByPollId from '../postgres/queries/getPollOptionsByPollId'
import getPollByDiscussionId from '../postgres/queries/getPollByDiscussionId'
import getPollsById from '../postgres/queries/getPollById'
import {IGetPollOptionsByPollIdQueryResult} from '../postgres/queries/generated/getPollsOptionsByPollIdQuery'
import {IGetPollsByIdQueryResult} from '../postgres/queries/generated/getPollsByIdQuery'
import {IGetPollsByDiscussionIdQueryResult} from '../postgres/queries/generated/getPollsByDiscussionIdQuery'

export const pollOptions = (parent: RethinkDataLoader) => {
  return new DataLoader<number, IGetPollOptionsByPollIdQueryResult[], string>(
    async (pollIds) => {
      const rows = (await getPollOptionsByPollId(pollIds)) || []
      return pollIds.map((pollId) => rows.filter((row) => row.pollId === pollId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const polls = (parent: RethinkDataLoader) => {
  return new DataLoader<number, IGetPollsByIdQueryResult | null, string>(
    async (pollIds) => {
      const rows = (await getPollsById(pollIds)) || []
      return pollIds.map((pollId) => rows.find((row) => row.id === pollId) || null)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const pollsByDiscussionId = (parent: RethinkDataLoader) => {
  return new DataLoader<string, IGetPollsByDiscussionIdQueryResult[], string>(
    async (discussionIds) => {
      const rows = (await getPollByDiscussionId(discussionIds)) || []
      return discussionIds.map((discussionId) =>
        rows.filter((row) => row.discussionId === discussionId)
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
