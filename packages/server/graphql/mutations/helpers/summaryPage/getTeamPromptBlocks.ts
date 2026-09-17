import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'
import getSharedTeamPromptResponses from '../getSharedTeamPromptResponses'

export const getTeamPromptBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const responses = await getSharedTeamPromptResponses(meetingId, dataLoader)
  const responseBlocks = await Promise.all(
    responses.map(async (response) => {
      const {userId, content} = response
      if (!userId) return null
      const user = await dataLoader.get('users').loadNonNull(userId)
      const {preferredName, picture} = user
      return {
        type: 'responseBlock' as const,
        attrs: {
          content: JSON.stringify(content),
          preferredName,
          avatar: picture
        }
      }
    })
  )
  const validResponseBlocks = responseBlocks.filter(isValid)
  const responseCount = validResponseBlocks.length
  if (responseCount === 0) return []
  return [
    {
      type: 'heading',
      attrs: {level: 2},
      content: [{type: 'text', text: `${responseCount} ${plural(responseCount, 'Response')}`}]
    },
    ...validResponseBlocks
  ]
}
