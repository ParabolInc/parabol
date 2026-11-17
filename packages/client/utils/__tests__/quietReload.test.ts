import ms from 'ms'
import {canAttemptReload, canReloadQuietly, nextReloadAttempt, type PageState} from '../quietReload'

const idlePage: PageState = {
  pathname: '/me/tasks',
  isEditing: false,
  hasOpenDialog: false,
  hasUnloadWarning: false
}

describe('canReloadQuietly', () => {
  it('reloads an idle page, in place or at a destination', () => {
    expect(canReloadQuietly(idlePage)).toBe(true)
    expect(canReloadQuietly(idlePage, '/team/team1')).toBe(true)
  })

  it('waits while the viewer is typing, has a dialog open or a page asked to confirm leaving', () => {
    expect(canReloadQuietly({...idlePage, isEditing: true})).toBe(false)
    expect(canReloadQuietly({...idlePage, hasOpenDialog: true}, '/team/team1')).toBe(false)
    expect(canReloadQuietly({...idlePage, hasUnloadWarning: true})).toBe(false)
  })

  it('never reloads a meeting in place or between its phases', () => {
    const meetingPage = {...idlePage, pathname: '/meet/meeting1/discuss/1'}
    expect(canReloadQuietly(meetingPage)).toBe(false)
    expect(canReloadQuietly(meetingPage, '/meet/meeting1/discuss/2')).toBe(false)
    expect(canReloadQuietly(meetingPage, '/meet/meeting1')).toBe(false)
  })

  it('loads the new build when the viewer leaves the meeting', () => {
    const meetingPage = {...idlePage, pathname: '/meet/meeting1/discuss/1'}
    expect(canReloadQuietly(meetingPage, '/new-summary/meeting1')).toBe(true)
    expect(canReloadQuietly(meetingPage, '/meet/meeting2')).toBe(true)
  })

  it('keeps a demo, which only lives in this page, through to its summary', () => {
    const demoPage = {...idlePage, pathname: '/retrospective-demo/reflect'}
    expect(canReloadQuietly(demoPage)).toBe(false)
    expect(canReloadQuietly(demoPage, '/retrospective-demo-summary')).toBe(false)
    expect(canReloadQuietly(demoPage, '/create-account')).toBe(true)
    expect(canReloadQuietly({...idlePage, pathname: '/team-health-demo/vote'})).toBe(false)
  })
})

describe('reload loop guard', () => {
  const now = Date.parse('2026-11-04T12:00:00Z')

  it('reloads at once after an upgrade or the first time', () => {
    expect(canAttemptReload(null, '15.9.0', now)).toBe(true)
    const upgradedAttempt = {fromVersion: '15.8.0', count: 3, at: now}
    expect(canAttemptReload(upgradedAttempt, '15.9.0', now)).toBe(true)
    expect(nextReloadAttempt(upgradedAttempt, '15.9.0', now)).toEqual({
      fromVersion: '15.9.0',
      count: 1,
      at: now
    })
  })

  it('backs off while reloads keep bringing back the same build, then gives up', () => {
    let attempt = nextReloadAttempt(null, '15.9.0', now)
    expect(canAttemptReload(attempt, '15.9.0', now + ms('4m'))).toBe(false)
    expect(canAttemptReload(attempt, '15.9.0', now + ms('5m'))).toBe(true)

    attempt = nextReloadAttempt(attempt, '15.9.0', now + ms('5m'))
    expect(attempt.count).toBe(2)
    expect(canAttemptReload(attempt, '15.9.0', now + ms('14m'))).toBe(false)
    expect(canAttemptReload(attempt, '15.9.0', now + ms('15m'))).toBe(true)

    attempt = nextReloadAttempt(attempt, '15.9.0', now + ms('15m'))
    expect(canAttemptReload(attempt, '15.9.0', now + ms('1d'))).toBe(false)
  })
})
