import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import {MutationResolvers} from '../resolverTypes'

const autogroup: MutationResolvers['autogroup'] = async (
  _source,
  {meetingId}: {meetingId: string},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  console.log('🚀 ~ autogroup....:', {viewerId, meetingId})
  const now = new Date()
  const r = await getRethink()

  // VALIDATION
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})
    .orderBy('createdAt')
    .run()

  const reflectionText = reflections.map((reflection) => reflection.plaintextContent)
  const manager = new OpenAIServerManager()
  const groupedReflections = await manager.groupReflections(reflectionText)
  console.log('🚀 ~ groupedReflections:', groupedReflections)
  groupedReflections.forEach(async (group, index) => {
    const reflectionsTextInGroup = Object.values(group).flat()
    const smartTitle = Object.keys(group).join(', ')
    console.log('🚀 ~ reflectionsTextInGroup:', {reflectionsTextInGroup, smartTitle})
    if (reflectionsTextInGroup.length === 1) {
      console.log('only one')
      return
    }
    const firstReflection = reflections.find(
      (reflection) => reflection.plaintextContent === reflectionsTextInGroup[0]
    )
    console.log('🚀 ~ firstReflection:', firstReflection)
    const promises = reflectionsTextInGroup.slice(1).map((reflectionTextInGroup) => {
      const originalReflection = reflections.find(
        (reflection) => reflectionTextInGroup === reflection.plaintextContent
      )
      console.log('🚀 ~ originalReflection:', originalReflection)
      if (!originalReflection || !firstReflection) return null
      return addReflectionToGroup(
        originalReflection.id,
        firstReflection.reflectionGroupId,
        {
          dataLoader
        } as any,
        smartTitle
      )
    })
    await Promise.all(promises)
  })

  // RESOLUTION
  const data = {}
  return data
}

export default autogroup
