import User from '../database/types/User'
import getSAMLURLFromEmail from '../utils/getSAMLURLFromEmail'
import {DataLoaderWorker} from '../graphql/graphql'
import RootDataLoader from '../dataloader/RootDataLoader'

const isUserVerified = async (
  user: Pick<User, 'identities' | 'email'>,
  dataLoader: DataLoaderWorker | RootDataLoader
) => {
  const {identities} = user
  const hasVerifiedIdentity = identities.some((identity) => identity.isEmailVerified)
  if (hasVerifiedIdentity) return true
  return !!(await getSAMLURLFromEmail(user.email, dataLoader, false))
}

export default isUserVerified
