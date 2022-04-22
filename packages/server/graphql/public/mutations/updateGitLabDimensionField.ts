import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingPoker from '../../../database/types/MeetingPoker'
import upsertGitLabDimensionFieldMap from '../../../postgres/queries/upsertGitLabDimensionFieldMap'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const updateGitLabDimensionField: MutationResolvers['updateGitLabDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, gid},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return {error: {message: 'Invalid meetingId'}}
  }
  const {teamId, templateRefId} = meeting as MeetingPoker
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on team'}}
  }
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const matchingDimension = dimensions.find((dimension) => dimension.name === dimensionName)
  if (!matchingDimension) {
    return {error: {message: 'Invalid dimension name'}}
  }

  // TODO validate labelTemplate

  // RESOLUTION
  try {
    await upsertGitLabDimensionFieldMap(teamId, dimensionName, gid, labelTemplate)
  } catch (e) {
    console.log(e)
  }

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitLabDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateGitLabDimensionField
