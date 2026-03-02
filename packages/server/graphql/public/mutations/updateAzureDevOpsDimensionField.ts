import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {isTeamMember} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateAzureDevOpsDimensionField: MutationResolvers['updateAzureDevOpsDimensionField'] =
  async (
    _source,
    {dimensionName, fieldName, meetingId, instanceId, projectKey, workItemType},
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
        .insertInto('AzureDevOpsDimensionFieldMap')
        .values({
          teamId,
          dimensionName,
          fieldName,
          fieldId: fieldName,
          instanceId,
          fieldType: 'string',
          projectKey,
          workItemType
        })
        .onConflict((oc) =>
          oc
            .columns(['teamId', 'dimensionName', 'instanceId', 'projectKey', 'workItemType'])
            .doUpdateSet((eb) => ({
              fieldName: eb.ref('excluded.fieldName'),
              fieldId: eb.ref('excluded.fieldId'),
              fieldType: eb.ref('excluded.fieldType')
            }))
        )
        .execute()
    } catch (e) {
      Logger.log(e)
    }

    const data = {teamId, meetingId}
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdateAzureDevOpsDimensionFieldSuccess',
      data,
      subOptions
    )
    return data
  }

export default updateAzureDevOpsDimensionField
