import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import canAdminMeetingSeries from '../../mutations/helpers/canAdminMeetingSeries'
import type {MutationResolvers} from '../resolverTypes'
import {applySeriesRecurrence} from './updateRecurrenceSettings'

const updateMeetingSeries: MutationResolvers['updateMeetingSeries'] = async (
  _source,
  {meetingSeriesId, name, rrule: rruleString},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  const numericId = MeetingSeriesId.split(meetingSeriesId)
  if (!Number.isFinite(numericId)) {
    return standardError(new Error('Invalid meeting series id'), {userId: viewerId})
  }
  const [meetingSeries, viewer] = await Promise.all([
    dataLoader.get('meetingSeries').load(numericId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!meetingSeries) {
    return standardError(new Error('Meeting series not found'), {userId: viewerId})
  }
  if (!(await canAdminMeetingSeries(meetingSeries, authToken, dataLoader))) {
    return standardError(new Error('Only the owner of this meeting series can change it'), {
      userId: viewerId
    })
  }

  const {seriesIds} = await applySeriesRecurrence(meetingSeries, {rrule, name}, viewer, dataLoader)
  // read the teams before clearing the cache, so the subscription reaches every team on the group
  const seriesTeamIds = new Set(
    (await dataLoader.get('meetingSeries').loadMany(seriesIds))
      .filter(isValid)
      .map((series) => series.teamId)
  )
  dataLoader.clearAll(['meetingSeries', 'newMeetings'])

  const data = {meetingSeriesId: numericId}
  for (const seriesTeamId of seriesTeamIds) {
    publish(SubscriptionChannel.TEAM, seriesTeamId, 'UpdateMeetingSeriesSuccess', data, subOptions)
  }
  return data
}

export default updateMeetingSeries
