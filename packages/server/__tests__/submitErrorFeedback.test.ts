import {randomUUID} from 'crypto'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const SUBMIT_ERROR_FEEDBACK = `
  mutation SubmitErrorFeedback($errorMessage: String!, $content: String!, $eventId: ID!, $email: String) {
    submitErrorFeedback(errorMessage: $errorMessage, content: $content, eventId: $eventId, email: $email) {
      success
    }
  }
`

const findFeedback = (eventId: string) =>
  getKysely()
    .selectFrom('ErrorFeedback')
    .selectAll()
    .where('eventId', '=', eventId)
    .executeTakeFirst()

test('anonymous submitter: row stores client email, ip, and no userId', async () => {
  const eventId = randomUUID()
  const res = await sendPublic({
    query: SUBMIT_ERROR_FEEDBACK,
    variables: {
      errorMessage: 'Boom',
      content: '  I clicked the thing  ',
      eventId,
      email: '  Anon@Example.com '
    }
  })
  expect(res).toMatchObject({data: {submitErrorFeedback: {success: true}}})

  const row = await findFeedback(eventId)
  expect(row).toMatchObject({
    userId: null,
    email: 'anon@example.com',
    errorMessage: 'Boom',
    content: 'I clicked the thing'
  })
  expect(row!.ip).toBeTruthy()
})

test('authenticated submitter: server derives userId and email, ignoring client email', async () => {
  const {userId, email, cookie} = await signUp()
  const eventId = randomUUID()
  const res = await sendPublic({
    query: SUBMIT_ERROR_FEEDBACK,
    variables: {
      errorMessage: 'Boom',
      content: 'Meeting page crashed',
      eventId,
      email: 'spoofed@example.com'
    },
    cookie
  })
  expect(res).toMatchObject({data: {submitErrorFeedback: {success: true}}})

  const row = await findFeedback(eventId)
  expect(row).toMatchObject({userId, email})
})

test('rejects non-UUID eventId and empty content', async () => {
  const badEventId = await sendPublic({
    query: SUBMIT_ERROR_FEEDBACK,
    variables: {errorMessage: 'Boom', content: 'x', eventId: 'not-a-uuid'}
  })
  expect(badEventId.errors?.[0]?.message).toMatch(/eventId/)

  const eventId = randomUUID()
  const emptyContent = await sendPublic({
    query: SUBMIT_ERROR_FEEDBACK,
    variables: {errorMessage: 'Boom', content: '   ', eventId}
  })
  expect(emptyContent.errors?.[0]?.message).toMatch(/content/i)
  expect(await findFeedback(eventId)).toBeUndefined()
})
