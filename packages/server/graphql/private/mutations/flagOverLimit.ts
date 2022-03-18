import {USER_OVERLIMIT_COPY_LIMIT} from '../../../postgres/constants'
import updateUser from '../../../postgres/queries/updateUser'
import {requireSU} from '../../../utils/authorization'
import {MutationResolvers} from '../resolverTypes'

const flagOverLimit: MutationResolvers['flagOverLimit'] = async (
  _source,
  {copy, orgId},
  {authToken, dataLoader}
) => {
  // AUTH
  requireSU(authToken)

  // VALIDATION
  const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  if (organizationUsers.length === 0) return {error: {message: 'OrgId has no members'}}

  if (copy.length > USER_OVERLIMIT_COPY_LIMIT) {
    return {error: {message: `copy must be ${USER_OVERLIMIT_COPY_LIMIT} chars or less`}}
  }

  // RESOLUTION
  const userIds = organizationUsers.map(({userId}) => userId)
  await updateUser(
    {
      overLimitCopy: copy === null ? '' : copy
    },
    userIds
  )
  return {userIds}
}

export default flagOverLimit
