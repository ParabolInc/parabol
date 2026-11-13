import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const toggleSummaryEmail: MutationResolvers['toggleSummaryEmail'] = async (
  _source,
  _args,
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const viewer = await getUserById(viewerId)
  if (!viewer) throw new GraphQLError('User not found', {extensions: {code: 'NOT_FOUND'}})

  // RESOLUTION
  const {sendSummaryEmail} = viewer
  const pg = getKysely()
  await pg
    .updateTable('User')
    .set({sendSummaryEmail: !sendSummaryEmail})
    .where('id', '=', viewerId)
    .execute()

  return true as const
}

export default toggleSummaryEmail
