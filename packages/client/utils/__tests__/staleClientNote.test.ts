import {isClientOutdated, setConnectedServerVersion} from '../connectedServerVersion'
import {rememberServerErrors, STALE_CLIENT_NOTE, withStaleClientNote} from '../staleClientNote'

beforeAll(() => {
  Object.assign(globalThis, {__APP_VERSION__: '15.9.0'})
  rememberServerErrors([{message: 'Unexpected error.'}, {message: 'Team not found'}])
})

describe('isClientOutdated', () => {
  it('knows nothing before the socket connects', () => {
    expect(isClientOutdated()).toBe(false)
  })

  it('is outdated only when the server is newer', () => {
    setConnectedServerVersion('15.10.0')
    expect(isClientOutdated()).toBe(true)
    setConnectedServerVersion('15.9.0')
    expect(isClientOutdated()).toBe(false)
    // a fresh page can reach a server still on the previous release during a rolling deploy
    setConnectedServerVersion('15.8.3')
    expect(isClientOutdated()).toBe(false)
  })
})

describe('withStaleClientNote', () => {
  it('adds the note to an error the server sent', () => {
    setConnectedServerVersion('15.10.0')
    expect(withStaleClientNote('Unexpected error.')).toBe(`Unexpected error. ${STALE_CLIENT_NOTE}`)
    expect(withStaleClientNote('Could not archive: Team not found')).toBe(
      `Could not archive: Team not found. ${STALE_CLIENT_NOTE}`
    )
  })

  it('leaves errors from this client alone', () => {
    setConnectedServerVersion('15.10.0')
    expect(withStaleClientNote('File is too big')).toBe('File is too big')
  })

  it('leaves every message alone when the client is current or newer', () => {
    setConnectedServerVersion('15.9.0')
    expect(withStaleClientNote('Unexpected error.')).toBe('Unexpected error.')
    setConnectedServerVersion('15.8.0')
    expect(withStaleClientNote('Unexpected error.')).toBe('Unexpected error.')
  })
})
