import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import PayLaterPayload from '../types/PayLaterPayload'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import {SubscriptionChannel} from 'parabol-client/src/types/constEnums'
import publish from '../../utils/publish'
import Meeting from '../../database/types/Meeting'

export default {
  type: new GraphQLNonNull(PayLaterPayload),
  description: `Increment the count of times the org has clicked pay later`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org that has clicked pay later'
    }
  },
  resolve: async (
    _source,
    {meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const meeting = (await r
      .table('NewMeeting')
      .get(meetingId)
      .run()) as Meeting | null
    if (!meeting) {
      return standardError(new Error('Invalid meeting'), {userId: viewerId})
    }
    const {teamId, showConversionModal} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Meeting not found'), {userId: viewerId})
    }
    if (!showConversionModal) {
      return standardError(new Error('Already clicked'), {userId: viewerId})
    }

    // RESOLUTION
    const team = await dataLoader.get('teams').load(teamId)
    const {orgId} = team
    await r
      .table('Organization')
      .get(orgId)
      .update((row) => ({
        payLaterClickCount: row('payLaterClickCount')
          .default(0)
          .add(1)
      }))
      .run()
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        showConversionModal: false
      })
      .run()

    const organization = await dataLoader.get('organizations').load(orgId)
    sendSegmentEvent('Conversion Modal Pay Later Clicked', viewerId, {
      payLaterOrgId: orgId,
      payLaterClickCount: organization.payLaterClickCount
    }).catch()
    const data = {orgId, meetingId}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'PayLaterPayload', data, subOptions)
    return {orgId, meetingId}
  }
}
