import {GraphQLError} from 'graphql'
import {USER_OVERLIMIT_COPY_LIMIT} from '../../../postgres/constants'
import updateUser from '../../../postgres/queries/updateUser'
import type {MutationResolvers} from '../resolverTypes'

const flagOverLimit: MutationResolvers['flagOverLimit'] = async (
  _source,
  {copy, orgId},
  {dataLoader}
) => {
  // VALIDATION
  const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  if (organizationUsers.length === 0)
    throw new GraphQLError('OrgId has no members', {extensions: {code: 'CONFLICT'}})

  if (copy.length > USER_OVERLIMIT_COPY_LIMIT) {
    throw new GraphQLError(`copy must be ${USER_OVERLIMIT_COPY_LIMIT} chars or less`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
