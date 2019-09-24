import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isUserInOrg} from '../../utils/authorization'
import PayLaterPayload from '../types/PayLaterPayload'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import sendSegmentEvent from '../../utils/sendSegmentEvent'

export default {
  type: new GraphQLNonNull(PayLaterPayload),
  description: `Increment the count of times the org has clicked pay later`,
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that has clicked pay later'
    }
  },
  resolve: async (_source, {orgId}, {authToken, dataLoader}: GQLContext) => {
    const r = getRethink()

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserInOrg(viewerId, orgId))) {
      return standardError(new Error('Organization not found'), {userId: viewerId})
    }

    await r
      .table('Organization')
      .get(orgId)
      .update((row) => ({
        payLaterClickCount: row('payLaterClickCount').default(0).add(1)
      }))

    const organization = await dataLoader.get('organizations').load(orgId)
    sendSegmentEvent('Conversion Modal Pay Later Clicked', viewerId, {
      payLaterOrgId: orgId,
      payLaterClickCount: organization.payLaterClickCount
    }).catch()
    return {orgId}
  }
}
