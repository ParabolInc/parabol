import {sendIntranet, sendPublic, signUp, subscribeToNotifications} from './common'

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

test('the facilitator receives a meeting stage time limit notification when the timer ends', async () => {
  const {cookie, teamId} = await signUp()
  const token = cookie.split('__Host-Http-authToken=')[1]!.split(';')[0]!
  const meetingId = await startRetro(teamId, cookie)
  const {socket, waitFor} = await subscribeToNotifications(token, NOTIFICATION_SUBSCRIPTION)

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
