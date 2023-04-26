import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {GQLContext} from '../../graphql'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import {MutationResolvers} from '../resolverTypes'

const autogroup: MutationResolvers['autogroup'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  // const
  // const viewerId = getUserId(authToken)
  console.log('🚀 ~ autogroup....:', {meetingId})
  const r = await getRethink()

  // VALIDATION
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})
    .orderBy('createdAt')
    .run()

  const reflectionText = reflections.map(({plaintextContent}) => plaintextContent)
  console.log('🚀 ~ reflectionText:', reflectionText)
  const manager = new OpenAIServerManager()

  const groupedReflections = await manager.groupReflections(reflectionText)

  for (const group of groupedReflections) {
    const reflectionsTextInGroup = Object.values(group).flat()
    const smartTitle = Object.keys(group).join(', ')

    console.log('🚀 ~ reflectionsTextInGroup:', {
      reflectionsTextInGroup,
      smartTitle,
      firstOne: reflectionsTextInGroup[0]
    })

    if (reflectionsTextInGroup.length === 1) {
      console.log('only one')
      continue
    }

    const [firstReflection] = reflections.filter(
      ({plaintextContent}) => reflectionsTextInGroup[0] === plaintextContent
    )

    if (!firstReflection) {
      console.log('🚀 ~ firstReflection:', {firstReflection, firstText: reflectionsTextInGroup[0]})
    }

    for (const reflectionTextInGroup of reflectionsTextInGroup.slice(1)) {
      const originalReflection = reflections.find(
        ({plaintextContent}) => plaintextContent === reflectionTextInGroup
      )
      // console.log('🚀 ~ originalReflection:', originalReflection)

      if (!originalReflection || !firstReflection) continue

      try {
        await addReflectionToGroup(
          originalReflection.id,
          firstReflection.reflectionGroupId,
          context,
          smartTitle
        )
      } catch (error) {
        console.error('Error adding reflection to group:', error)
      }
    }
  }

  // RESOLUTION
  const data = {success: true}
  return data
}

export default autogroup
