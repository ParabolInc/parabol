import {DataLoaderWorker} from '../../graphql'
import getRethink from '../../../database/rethinkDriver'

// finds all the users who are at the same url
const getUsersToIgnore = async (viewerId: string, teamId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const viewer = await dataLoader.get('users').load(viewerId)
  const lastSeenAtURL = viewer.lastSeenAtURL || ''
  if (!lastSeenAtURL.startsWith('/meet')) return []
  return (r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isNotRemoved: true})
    .merge((teamMember) => ({
      lastSeenAtURL: r
        .table('User')
        .get(teamMember('userId'))('lastSeenAtURL')
        .default('~')
    }))
    .filter({lastSeenAtURL})('userId')
    .run() as unknown) as string[]
}

export default getUsersToIgnore
