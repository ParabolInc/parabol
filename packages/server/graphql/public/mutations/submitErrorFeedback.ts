import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

const MAX_FIELD_LENGTH = 2000

const submitErrorFeedback: MutationResolvers['submitErrorFeedback'] = async (
  _source,
  {errorMessage, content, eventId, email},
  {authToken}
) => {
  const viewerId = getUserId(authToken) || null
  const pg = getKysely()
  const {id} = await pg
    .insertInto('ErrorFeedback')
    .values({
      userId: viewerId,
      email: email?.trim().slice(0, 255) || null,
      errorMessage: errorMessage.trim().slice(0, MAX_FIELD_LENGTH),
      content: content.trim().slice(0, MAX_FIELD_LENGTH),
      eventId: eventId || null
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  return {feedbackId: String(id)}
}

export default submitErrorFeedback
