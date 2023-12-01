import {JSONContent} from '@tiptap/core'
import getRethink from '../../../../database/rethinkDriver'
import NotificationResponseMentioned from '../../../../database/types/NotificationResponseMentioned'
import {TeamPromptResponse} from '../../../../postgres/queries/getTeamPromptResponsesByIds'

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
  newResponse: TeamPromptResponse,
  addedKudoses:
    | {
        id: number
        emoji: string | null
        receiverUserId: string
      }[]
    | null
) => {
  // Get mentions from previous and new content.
  const newResponseMentions = getMentionedUserIdsFromContent(newResponse.content)
  const oldResponseMentions = oldResponse ? getMentionedUserIdsFromContent(oldResponse.content) : []

  const addedKudosesUserIds = addedKudoses?.map((kudos) => kudos.receiverUserId) ?? []

  // Create notifications that should be added.
  const addedMentions = Array.from(
    new Set(
      newResponseMentions.filter(
        (mention) =>
          (!oldResponseMentions.includes(mention) && newResponse.userId !== mention) ||
          // Send mention notification anyway in case it is also include kudos
          addedKudosesUserIds.includes(mention)
      )
    )
  )

  if (addedMentions.length === 0) {
    return []
  }

  const notificationsToAdd = addedMentions.map(
    (mention) =>
      new NotificationResponseMentioned({
        userId: mention,
        responseId: newResponse.id,
        meetingId: newResponse.meetingId,
        kudosEmoji: addedKudoses?.find((kudos) => kudos.receiverUserId === mention)?.emoji
      })
  )

  const r = await getRethink()
  await r.table('Notification').insert(notificationsToAdd).run()

  return notificationsToAdd
}

export default createTeamPromptMentionNotifications
