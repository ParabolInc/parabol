/* eslint-env jest */
import mockAuthToken from '../../../../__tests__/setup/mockAuthToken'
import MockDB from '../../../../__tests__/setup/MockDB'
import {__anHourAgo, __now, __overADayAgo} from '../../../../__tests__/setup/mockTimes'
import getRethink from '../../../../database/rethinkDriver'
import {sendBatchEmail} from '../../../../email/sendEmail'
import sendBatchNotificationEmails from '../sendBatchNotificationEmails'

// Manage side-effects
console.error = jest.fn()
// `sendBatchEmail` is called by `sendBatchNotificationEmails`.
jest.mock('server/email/sendEmail')
sendBatchEmail.mockImplementation(() => Promise.resolve(true))

describe('sendBatchNotificationEmails', () => {
  beforeEach(async () => {
    sendBatchEmail.mockClear()
    // Unfortunately, other tests are not cleaning up after themselves. Since
    // "sending everyone with pending notifications an email" relies on the
    // global DB state, there's no getting around this.
    const r = await getRethink()
    await r.table('Notification').delete()
  })

  it('requires the superuser role', async () => {
    expect.assertions(2)

    // SETUP
    const db = new MockDB()
    const {
      user: [nonSuperUser]
    } = await db.newUser({name: 'not-a-superuser'})
    const nonSuperUserAuthToken = mockAuthToken(nonSuperUser)

    // TEST
    try {
      await sendBatchNotificationEmails.resolve(null, null, {
        authToken: nonSuperUserAuthToken
      })
    } catch (error) {
      expect(error.message).toMatch('Unauthorized')
      expect(sendBatchEmail.mock.calls).toEqual([])
    }
  })

  it('ignores users which have been seen within 24 hours', async () => {
    expect.assertions(2)

    // SETUP
    const db = new MockDB()
    const {
      user: [superUser]
    } = await db
      .newUser({name: 'superUser'})
      .newUser({
        name: 'user-within-24-hours',
        lastSeenAt: new Date(__anHourAgo)
      })
      .newOrg()
      .newNotification()
    const authToken = mockAuthToken(superUser, {rol: 'su'})

    // TEST
    const emailedUsers = await sendBatchNotificationEmails.resolve(null, null, {
      authToken
    })
    expect(emailedUsers).toEqual([])
    expect(sendBatchEmail.mock.calls).toEqual([])
  })

  it('ignores users that have not been seen within 24 hours, but have no new notifications', async () => {
    expect.assertions(2)

    // SETUP
    const db = new MockDB()
    const {
      user: [superUser]
    } = await db.newUser({name: 'superUser'}).newUser({
      name: 'user-over-24-hours',
      lastSeenAt: new Date(__overADayAgo)
    })
    const authToken = mockAuthToken(superUser, {rol: 'su'})

    // TEST
    const emailedUsers = await sendBatchNotificationEmails.resolve(null, null, {
      authToken
    })
    expect(emailedUsers).toEqual([])
    expect(sendBatchEmail.mock.calls).toEqual([])
  })

  it('ignores users which have not been seen within 24 hours, but also have no new notifications within the last 24 hours', async () => {
    expect.assertions(2)

    // SETUP
    const db = new MockDB()
    const {
      user: [superUser]
    } = await db
      .newUser({name: 'superUser'})
      .newUser({
        name: 'user-over-24-hours',
        lastSeenAt: new Date(__overADayAgo)
      })
      .newOrg()
      .newNotification({startAt: new Date(__overADayAgo)})
    const authToken = mockAuthToken(superUser, {rol: 'su'})

    // TEST
    const emailedUsers = await sendBatchNotificationEmails.resolve(null, null, {
      authToken
    })
    expect(emailedUsers).toEqual([])
    expect(sendBatchEmail.mock.calls).toEqual([])
  })

  it('sends emails to users that have not been seen within 24 hours and have new notifications', async () => {
    expect.assertions(2)

    // SETUP
    const db = new MockDB()
    const {
      user: [superUser, notifiedUser]
    } = await db
      .newUser({name: 'superUser'})
      .newUser({
        name: 'user-not-within-24-hours',
        lastSeenAt: new Date(__overADayAgo)
      })
      .newOrg()
      .newNotification({startAt: new Date(__anHourAgo)})
    const authToken = mockAuthToken(superUser, {rol: 'su'})

    // TEST
    const emailedUsers = await sendBatchNotificationEmails.resolve(null, null, {
      authToken
    })
    expect(emailedUsers).toEqual([notifiedUser.email])
    expect(sendBatchEmail.mock.calls).toEqual([
      [
        [notifiedUser.email],
        'notificationSummary',
        {date: new Date(__now)},
        {
          [notifiedUser.email]: {
            name: notifiedUser.name,
            numNotifications: 1
          }
        }
      ]
    ])
  })
})
