import User from '../database/types/User'

const isUserVerified = (user: User) => {
  const {identities} = user
  return identities.some((identity) => identity.isEmailVerified)
}

export default isUserVerified
