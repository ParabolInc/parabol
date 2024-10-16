import {JSONContent} from '@tiptap/core'
import generateUID from '../../../../generateUID'
import getKysely from '../../../../postgres/getKysely'
import {TeamPromptResponse} from '../../../../postgres/types'

const getMentionedUserIdsFromContent = (content: JSONContent): string[] => {
  if (content.type === 'mention' && content.attrs?.id) {
    return [content.attrs.id]
  }

  if (!content.content) {
    return []
  }

  return content.content.map(getMentionedUserIdsFromContent).flat()
}

const createTeamPromptMentionNotifications = async (
  oldResponse: TeamPromptResponse | undefined,
  newResponse: TeamPromptResponse
) => {
  // Get mentions from previous and new content.
  const newResponseMentions = getMentionedUserIdsFromContent(newResponse.content)
  const oldResponseMentions = oldResponse ? getMentionedUserIdsFromContent(oldResponse.content) : []

  // Create notifications that should be added.
  const addedMentions = Array.from(
    new Set(
      newResponseMentions.filter(
        (mention) => !oldResponseMentions.includes(mention) && newResponse.userId !== mention
      )
    )
  )

  if (addedMentions.length === 0) {
    return []
  }

  const notificationsToAdd = addedMentions.map((mention) => ({
    id: generateUID(),
    type: 'RESPONSE_MENTIONED' as const,
    userId: mention,
    responseId: newResponse.id,
    meetingId: newResponse.meetingId
  }))

  const pg = getKysely()
  await pg.insertInto('Notification').values(notificationsToAdd).execute()
  return notificationsToAdd
}

export default createTeamPromptMentionNotifications
