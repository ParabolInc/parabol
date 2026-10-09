import type {DataLoaderWorker} from '../../../graphql'

export const loadUserPreview = async (userId: string | null, dataLoader: DataLoaderWorker) => {
  if (!userId) return null
  const user = await dataLoader.get('users').load(userId)
  if (!user) return null
  return {...user, id: `preview:${user.id}`}
}
