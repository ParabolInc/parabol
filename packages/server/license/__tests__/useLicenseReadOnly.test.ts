import {parse} from 'graphql'
import {canTurnReadOnly, getInstanceLicense, isLicenseReadOnly} from '../instanceLicense'
import {useLicenseReadOnly} from '../useLicenseReadOnly'

jest.mock('../instanceLicense', () => ({
  canTurnReadOnly: jest.fn(),
  getInstanceLicense: jest.fn(),
  isLicenseReadOnly: jest.fn()
}))
const mockCanTurn = canTurnReadOnly as jest.Mock
const mockReadOnly = isLicenseReadOnly as jest.Mock
const mockLicense = getInstanceLicense as jest.Mock

const run = (query: string, authToken: object = {sub: 'u1'}) => {
  const setResultAndStopExecution = jest.fn()
  useLicenseReadOnly().onExecute!({
    args: {document: parse(query), contextValue: {authToken}},
    setResultAndStopExecution
  } as any)
  return setResultAndStopExecution
}

beforeEach(() => {
  mockCanTurn.mockReturnValue(true)
  mockReadOnly.mockReturnValue(true)
  mockLicense.mockReturnValue({ok: true, claims: {expiresAt: '2027-01-01T00:00:00.000Z'}})
})

describe('useLicenseReadOnly', () => {
  test('refuses changes once an expired license asks for read-only', () => {
    const refused = run('mutation { addAgendaItem(newAgendaItem: {}) { __typename } }')
    expect(refused).toHaveBeenCalledTimes(1)
    const [{errors}] = refused.mock.calls[0]
    expect(errors[0].message).toBe(
      'This Parabol instance’s license expired on 2027-01-01, so Parabol is read-only: nothing can be changed. Contact Parabol to renew it.'
    )
    expect(errors[0].extensions.code).toBe('FORBIDDEN')
  })

  test('still lets people sign in, and read', () => {
    expect(
      run('mutation { loginWithPassword(email: "a", password: "b") { __typename } }')
    ).not.toHaveBeenCalled()
    expect(run('mutation { refreshSession }')).not.toHaveBeenCalled()
    expect(run('query { viewer { id } }')).not.toHaveBeenCalled()
  })

  test('refuses a sign-in sent with a change', () => {
    expect(
      run('mutation { refreshSession addAgendaItem(newAgendaItem: {}) { __typename } }')
    ).toHaveBeenCalled()
  })

  test('leaves super users alone, and the server’s own calls, such as SAML sign-in', () => {
    expect(
      run('mutation { loginSAML(queryString: "q", samlName: "acme") { __typename } }', {
        sub: 'aGhostUser',
        rol: 'su'
      })
    ).not.toHaveBeenCalled()
    expect(
      run('mutation { loginSAML(queryString: "q", samlName: "acme") { __typename } }')
    ).toHaveBeenCalled()
  })

  test('adds no hook for a license that can never turn the instance read-only', () => {
    mockCanTurn.mockReturnValue(false)
    expect(useLicenseReadOnly().onExecute).toBeUndefined()
  })

  test('does nothing while the license allows changes', () => {
    mockReadOnly.mockReturnValue(false)
    expect(
      run('mutation { addAgendaItem(newAgendaItem: {}) { __typename } }')
    ).not.toHaveBeenCalled()
  })
})
