import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import normalizeEmail from '../../../utils/normalizeEmail'
import type {MutationResolvers} from '../resolverTypes'

const MAX_FIELD_LENGTH = 2000
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const submitErrorFeedback: MutationResolvers['submitErrorFeedback'] = async (
  _source,
  {errorMessage, content, eventId, email},
  {authToken, dataLoader, ip}
) => {
  if (!UUID_REGEX.test(eventId)) throw new GraphQLError('eventId must be a UUID')
  const trimmedContent = content.trim()
  if (!trimmedContent) throw new GraphQLError('content cannot be empty')

  const viewerId = getUserId(authToken) || null
  const viewer = viewerId ? await dataLoader.get('users').load(viewerId) : null
  const contactEmail = viewer ? viewer.email : email ? normalizeEmail(email).slice(0, 255) : null

  await getKysely()
    .insertInto('ErrorFeedback')
    .values({
      userId: viewer?.id ?? null,
      email: contactEmail || null,
      ip: ip || null,
      errorMessage: errorMessage.trim().slice(0, MAX_FIELD_LENGTH),
      content: trimmedContent.slice(0, MAX_FIELD_LENGTH),
      eventId
    })
    .execute()
  return {success: true}
}

export default submitErrorFeedback
