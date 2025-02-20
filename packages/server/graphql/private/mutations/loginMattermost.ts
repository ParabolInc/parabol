import AuthToken from '../../../database/types/AuthToken'
import getKysely from '../../../postgres/getKysely'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import {MutationResolvers} from '../resolverTypes'

const loginMattermost: MutationResolvers['loginMattermost'] = async (
  _source,
  {email}
) => {
  const pg = getKysely()
  const user = await pg
    .selectFrom('User')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst()
  if (!user) {
    return {error: {message: 'Unknown user'}}
  }
  const {id: userId, tms} = user
  const authToken = new AuthToken({sub: userId, tms})

  return {
    userId,
    authToken: encodeAuthToken(authToken),
    isNewUser: false
  }
}

export default loginMattermost
