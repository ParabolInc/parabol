import {JSONContent} from '@tiptap/core'
import TeamPromptResponseId from '../../../../../client/shared/gqlIds/TeamPromptResponseId'
import getRethink from '../../../../database/rethinkDriver'
import NotificationResponseMentioned from '../../../../database/types/NotificationResponseMentioned'
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

  const notificationsToAdd = addedMentions.map((mention) => {
    return new NotificationResponseMentioned({
      userId: mention,
      // hack to turn the DB id into the GQL ID. The GDL ID should only be used in GQL resolvers, but i didn't catch this before it got built
      responseId: TeamPromptResponseId.join(newResponse.id),
      meetingId: newResponse.meetingId
    })
  })

  const r = await getRethink()
  const pg = getKysely()
  await r.table('Notification').insert(notificationsToAdd).run()
  await pg
    .insertInto('Notification')
    .values(
      notificationsToAdd.map((n) => ({...n, responseId: TeamPromptResponseId.split(n.responseId)}))
    )
    .execute()
  return notificationsToAdd
}

export default createTeamPromptMentionNotifications
