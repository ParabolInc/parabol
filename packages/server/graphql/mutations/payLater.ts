import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isUserInOrg} from '../../utils/authorization'
import PayLaterPayload from '../types/PayLaterPayload'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import hideConversionModal from './helpers/hideConversionModal'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../utils/publish'

export default {
  type: new GraphQLNonNull(PayLaterPayload),
  description: `Increment the count of times the org has clicked pay later`,
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that has clicked pay later'
    }
  },
  resolve: async (_source, {orgId}, {authToken, dataLoader, socketId: mutatorId}: GQLContext) => {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

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

    const activeMeetings = await hideConversionModal(orgId, dataLoader)
    const organization = await dataLoader.get('organizations').load(orgId)
    sendSegmentEvent('Conversion Modal Pay Later Clicked', viewerId, {
      payLaterOrgId: orgId,
      payLaterClickCount: organization.payLaterClickCount
    }).catch()
    // const teams = await dataLoader.get('teamsByOrgId').load(orgId)
    // const teamIds = teams.map(({id}) => id)
    // const teamIds = Array.from(new Set(activeMeetings.map(({teamId}) => teamId)))
    const meetingIds = activeMeetings.map(({id}) => id)
    const data = {orgId, meetingIds}
    publish(SubscriptionChannel.ORGANIZATION, orgId, PayLaterPayload, data, subOptions)
    return {orgId, meetingIds}
  }
}
