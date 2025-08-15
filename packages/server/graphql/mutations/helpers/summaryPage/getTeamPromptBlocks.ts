import plural from '../../../../../client/utils/plural'
import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'

export const getTeamPromptBlocks = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
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
