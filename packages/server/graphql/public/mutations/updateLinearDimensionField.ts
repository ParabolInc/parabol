import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {Logger} from '../../../utils/Logger'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const updateLinearDimensionField: MutationResolvers['updateLinearDimensionField'] = async (
  _source,
  {dimensionName, labelTemplate, meetingId, repoId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return {error: {message: 'Invalid meetingId'}}
  }
  if (meeting.meetingType !== 'poker') {
    return {error: {message: 'Not a poker meeting'}}
  }
  const {teamId, templateRefId} = meeting
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on team'}}
  }
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const matchingDimension = dimensions.find((dimension) => dimension.name === dimensionName)
  if (!matchingDimension) {
    return {error: {message: 'Invalid dimension name'}}
  }

  // RESOLUTION
  try {
    await pg
      .insertInto('LinearDimensionFieldMap')
      .values({
        teamId,
        dimensionName,
        repoId,
        labelTemplate
      })
      .onConflict((oc) =>
        oc.columns(['teamId', 'dimensionName', 'repoId']).doUpdateSet({labelTemplate})
      )
      .execute()
  } catch (e) {
    Logger.log(e)
  }

  const data = {meetingId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateLinearDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateLinearDimensionField
