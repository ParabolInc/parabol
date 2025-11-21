import type {User} from '../postgres/types'

const isUserVerified = (user: Pick<User, 'identities'>) => {
  const {identities} = user
  return identities.some((identity) => identity.isEmailVerified)
}

export default isUserVerified
