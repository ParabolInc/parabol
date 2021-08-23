import DataLoader from 'dataloader'
import RethinkDataLoader from './RethinkDataLoader'

export const pollOptions = (parent: RethinkDataLoader) => {
  return new DataLoader<string, number, string>(
    async (obj) => {
      console.log('poll options loader', obj)
      return []
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const polls = (parent: RethinkDataLoader) => {
  return new DataLoader<string, number, string>(
    async (obj) => {
      console.log('poll loader', obj)
      return []
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
