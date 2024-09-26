import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import PayLaterPayload from '../types/PayLaterPayload'

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
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const [meeting, viewer] = await Promise.all([
      dataLoader.get('newMeetings').load(meetingId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
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
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    await getKysely()
      .with('UpdateOrg', (qc) =>
        qc
          .updateTable('Organization')
          .set((eb) => ({
            payLaterClickCount: eb('payLaterClickCount', '+', 1)
          }))
          .where('id', '=', orgId)
      )
      .with('UpdateUser', (qc) =>
        qc
          .updateTable('User')
          .set((eb) => ({
            payLaterClickCount: eb('payLaterClickCount', '+', 1)
          }))
          .where('id', '=', viewerId)
      )
      .updateTable('NewMeeting')
      .set({showConversionModal: false})
      .where('id', '=', meetingId)
      .execute()
    dataLoader.clearAll(['newMeetings', 'organizations', 'users'])

    analytics.conversionModalPayLaterClicked(viewer)
    const data = {orgId, meetingId}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'PayLaterPayload', data, subOptions)
    return {orgId, meetingId}
  }
}
