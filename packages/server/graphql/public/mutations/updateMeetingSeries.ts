import {GraphQLError} from 'graphql'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import publish from '../../../utils/publish'
import isValid from '../../isValid'
import canAdminMeetingSeries from '../../mutations/helpers/canAdminMeetingSeries'
import type {MutationResolvers} from '../resolverTypes'
import {applySeriesRecurrence} from './updateRecurrenceSettings'

const updateMeetingSeries: MutationResolvers['updateMeetingSeries'] = async (
  _source,
  {meetingSeriesId, name, rrule: rruleString},
  {authToken, dataLoader, socketId: mutatorId, resourceGrants}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const rrule = rruleString ? RRuleSet.parse(rruleString) : null

  const numericId = MeetingSeriesId.split(meetingSeriesId)
  if (!Number.isFinite(numericId)) {
    throw new GraphQLError('Invalid meeting series id', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const meetingSeries = await dataLoader.get('meetingSeries').load(numericId)
  if (!meetingSeries) {
    throw new GraphQLError('Meeting series not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (!(await canAdminMeetingSeries(meetingSeries, authToken, dataLoader, resourceGrants))) {
    throw new GraphQLError('Only the owner of this meeting series can change it', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  const {seriesIds} = await applySeriesRecurrence(meetingSeries, {rrule, name}, dataLoader)
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
