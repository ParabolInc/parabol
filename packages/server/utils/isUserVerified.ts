import User from '../database/types/User'

const isUserVerified = (user: Pick<User, 'identities'>) => {
  const {identities} = user
  return identities.some((identity) => identity.isEmailVerified)
}

export default isUserVerified
