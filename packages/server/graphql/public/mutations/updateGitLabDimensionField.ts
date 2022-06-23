import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingPoker from '../../../database/types/MeetingPoker'
import upsertGitLabDimensionFieldMap from '../../../postgres/queries/upsertGitLabDimensionFieldMap'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'
import {getUserId} from './../../../utils/authorization'

const updateGitLabDimensionField: MutationResolvers['updateGitLabDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, projectId},
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
  const viewerId = getUserId(authToken)
  const gitlabAuth = await dataLoader.get('freshGitlabAuth').load({teamId, userId: viewerId})
  if (!gitlabAuth.providerId) return {error: {message: 'Invalid dimension name'}}

  // TODO validate labelTemplate

  // RESOLUTION
  try {
    const {providerId} = gitlabAuth
    await upsertGitLabDimensionFieldMap(teamId, dimensionName, projectId, providerId, labelTemplate)
  } catch (e) {
    console.log(e)
  }

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitLabDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateGitLabDimensionField
