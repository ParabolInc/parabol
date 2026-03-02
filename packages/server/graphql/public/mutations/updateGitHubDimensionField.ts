import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {isTeamMember} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateGitHubDimensionField: MutationResolvers['updateGitHubDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, nameWithOwner},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return {error: {message: 'Invalid meetingId'}}
  if (meeting.meetingType !== 'poker') return {error: {message: 'Not a poker meeting'}}
  const {teamId, templateRefId} = meeting
  if (!isTeamMember(authToken, teamId)) return {error: {message: 'Not on team'}}
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const matchingDimension = dimensions.find((dimension) => dimension.name === dimensionName)
  if (!matchingDimension) return {error: {message: 'Invalid dimension name'}}

  // RESOLUTION
  try {
    await getKysely()
      .insertInto('GitHubDimensionFieldMap')
      .values({teamId, dimensionName, nameWithOwner, labelTemplate})
      .onConflict((oc) =>
        oc.columns(['teamId', 'dimensionName', 'nameWithOwner']).doUpdateSet((eb) => ({
          labelTemplate: eb.ref('excluded.labelTemplate')
        }))
      )
      .execute()
  } catch (e) {
    Logger.log(e)
  }

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitHubDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateGitHubDimensionField
