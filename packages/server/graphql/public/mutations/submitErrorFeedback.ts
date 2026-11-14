import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import {Logger} from '../../../utils/Logger'
import normalizeEmail from '../../../utils/normalizeEmail'
import type {MutationResolvers} from '../resolverTypes'

const MAX_FIELD_LENGTH = 2000
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const submitErrorFeedback: MutationResolvers['submitErrorFeedback'] = async (
  _source,
  {errorMessage, content, eventId, email},
  {authToken, dataLoader, ip}
) => {
  if (!UUID_REGEX.test(eventId))
    throw new GraphQLError('eventId must be a UUID', {extensions: {code: 'BAD_USER_INPUT'}})
  const trimmedContent = content.trim()
  if (!trimmedContent)
    throw new GraphQLError('content cannot be empty', {extensions: {code: 'BAD_USER_INPUT'}})

  const viewerId = getUserId(authToken) || null
  const viewer = viewerId ? await dataLoader.get('users').load(viewerId) : null
  const contactEmail =
    (viewer ? viewer.email : email ? normalizeEmail(email).slice(0, 255) : null) || null
  const storedErrorMessage = errorMessage.trim().slice(0, MAX_FIELD_LENGTH)
  const storedContent = trimmedContent.slice(0, MAX_FIELD_LENGTH)

  await getKysely()
    .insertInto('ErrorFeedback')
    .values({
      userId: viewer?.id ?? null,
      email: contactEmail,
      ip: ip || null,
      errorMessage: storedErrorMessage,
      content: storedContent,
      eventId
    })
    .execute()
  // Beetee's intake finds the reported error by this eventId, which the browser logged with it, and fixes those first
  Logger.info('Error feedback', {
    client: {eventId},
    // left out when unknown, because Cloud Monitoring's Slack post would show a null as NULL_VALUE
    extras: {
      email: contactEmail ?? undefined,
      content: storedContent,
      errorMessage: storedErrorMessage
    }
  })
  return {success: true}
}

export default submitErrorFeedback
