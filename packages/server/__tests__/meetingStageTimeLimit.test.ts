import {HOST, persistQuery, sendIntranet, sendPublic, signUp, WS_PROTOCOL} from './common'

const NOTIFICATION_SUBSCRIPTION = `
  subscription MeetingStageTimeLimitNotificationSubscription {
    notificationSubscription {
      fieldName
      MeetingStageTimeLimitPayload {
        notification {
          id
          status
          createdAt
          meetingId
        }
      }
    }
  }
`

const startRetro = async (teamId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation StartRetrospectiveMutation($teamId: ID!) {
        startRetrospective(teamId: $teamId) {
          ... on StartRetrospectiveSuccess {
            meeting {
              id
            }
          }
        }
      }
    `,
    variables: {teamId},
    cookie
  })
  return res.data.startRetrospective.meeting.id as string
}

const subscribeToNotifications = async (token: string) => {
  const docId = await persistQuery(NOTIFICATION_SUBSCRIPTION)
  const socket = new WebSocket(`${WS_PROTOCOL}://${HOST}/`, 'graphql-transport-ws')
  const messages: {type: string; payload?: any}[] = []
  const listeners: (() => void)[] = []
  socket.addEventListener('message', (event) => {
    messages.push(JSON.parse(String(event.data)))
    listeners.forEach((listener) => listener())
  })
  const waitFor = (predicate: (message: {type: string; payload?: any}) => boolean) =>
    new Promise<{type: string; payload?: any}>((resolve) => {
      const check = () => {
        const message = messages.find(predicate)
        if (message) resolve(message)
      }
      listeners.push(check)
      check()
    })
  await new Promise((resolve) => socket.addEventListener('open', resolve))
  socket.send(JSON.stringify({type: 'connection_init', payload: {token}}))
  await waitFor(({type}) => type === 'connection_ack')
  socket.send(
    JSON.stringify({
      id: '1',
      type: 'subscribe',
      payload: {query: '', docId, extensions: {ackId: 'listening'}}
    })
  )
  await waitFor(({type, payload}) => type === 'ping' && payload?.ackId === 'listening')
  return {socket, waitFor}
}

test('the facilitator receives a meeting stage time limit notification when the timer ends', async () => {
  const {cookie, teamId} = await signUp()
  const token = cookie.split('__Host-Http-authToken=')[1]!.split(';')[0]!
  const meetingId = await startRetro(teamId, cookie)
  const {socket, waitFor} = await subscribeToNotifications(token)

  const timer = await sendPublic({
    query: `
      mutation SetStageTimerMutation($meetingId: ID!, $scheduledEndTime: DateTime) {
        setStageTimer(meetingId: $meetingId, scheduledEndTime: $scheduledEndTime) {
          __typename
        }
      }
    `,
    variables: {meetingId, scheduledEndTime: new Date(Date.now() + 1000).toJSON()},
    cookie
  })
  expect(timer.errors).toBeUndefined()

  const run = await sendIntranet({
    query: `
      mutation RunScheduledJobs($seconds: Int!) {
        runScheduledJobs(seconds: $seconds)
      }
    `,
    variables: {seconds: 10}
  })
  expect(run.errors).toBeUndefined()

  const message = await waitFor(
    ({type, payload}) =>
      type === 'next' &&
      payload?.data?.notificationSubscription?.fieldName === 'MeetingStageTimeLimitPayload'
  )
  socket.close()

  expect(message.payload.errors).toBeUndefined()
  expect(message.payload.data.notificationSubscription.MeetingStageTimeLimitPayload).toEqual({
    notification: {
      id: expect.any(String),
      status: 'UNREAD',
      createdAt: expect.any(String),
      meetingId
    }
  })
}, 20_000)
