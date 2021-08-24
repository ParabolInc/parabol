import DataLoader from 'dataloader'
import RethinkDataLoader from './RethinkDataLoader'
import getPollOptionsByPollId from '../postgres/queries/getPollOptionsByPollId'
import getPollsById from '../postgres/queries/getPollById'
import {IGetPollOptionsByPollIdQueryResult} from '../postgres/queries/generated/getPollsOptionsByPollIdQuery'
import {IGetPollsByIdQueryResult} from '../postgres/queries/generated/getPollsByIdQuery'

export const pollOptions = (parent: RethinkDataLoader) => {
  return new DataLoader<number, IGetPollOptionsByPollIdQueryResult[], string>(
    async (pollIds) => {
      console.log('pollOptions loader', pollIds)
      const rows = (await getPollOptionsByPollId(pollIds)) || []
      return pollIds.map((pollId) => rows.filter((row) => row.id === pollId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const polls = (parent: RethinkDataLoader) => {
  return new DataLoader<number, IGetPollsByIdQueryResult[], string>(
    async (pollIds) => {
      console.log('polls loader', pollIds)
      const rows = (await getPollsById(pollIds)) || []
      return pollIds.map((pollId) => rows.filter((row) => row.id === pollId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const pollsByDiscussionId = (parent: RethinkDataLoader) => {
  return new DataLoader<string, number, string>(
    async (obj) => {
      console.log('polls options loader', obj)
      return []
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
