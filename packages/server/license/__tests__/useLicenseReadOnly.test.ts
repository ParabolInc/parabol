import {parse} from 'graphql'
import {getCurrentLicenseStatus} from '../licenseState'
import {useLicenseReadOnly} from '../useLicenseReadOnly'

jest.mock('../licenseState', () => ({getCurrentLicenseStatus: jest.fn()}))
const mockStatus = getCurrentLicenseStatus as jest.Mock

const readOnlyStatus = {
  state: 'expired',
  readOnly: true,
  paidTiersAllowed: true,
  needsLicense: true,
  overSeats: false,
  expiresAt: new Date('2027-01-01'),
  expiry: {stage: {from: '180d', notice: 'everyone', action: 'read-only'}}
}

const run = (query: string, rol?: string) => {
  const setResultAndStopExecution = jest.fn()
  useLicenseReadOnly().onExecute!({
    args: {document: parse(query), contextValue: {authToken: rol ? {rol} : {sub: 'u1'}}},
    setResultAndStopExecution
  } as any)
  return setResultAndStopExecution
}

describe('useLicenseReadOnly', () => {
  test('refuses changes while the license makes the instance read-only', () => {
    mockStatus.mockReturnValue(readOnlyStatus)
    const refused = run('mutation { addAgendaItem(newAgendaItem: {}) { __typename } }')
    expect(refused).toHaveBeenCalledTimes(1)
    const [{errors}] = refused.mock.calls[0]
    expect(errors[0].message).toBe(
      "This Parabol instance's license expired on 2027-01-01, so Parabol is read-only: nothing can be changed. Contact Parabol to renew it."
    )
    expect(errors[0].extensions.code).toBe('LICENSE_READ_ONLY')
  })

  test('still lets people sign in, and read', () => {
    mockStatus.mockReturnValue(readOnlyStatus)
    expect(
      run('mutation { loginWithPassword(email: "a", password: "b") { __typename } }')
    ).not.toHaveBeenCalled()
    expect(run('mutation { refreshSession }')).not.toHaveBeenCalled()
    expect(run('query { viewer { id } }')).not.toHaveBeenCalled()
  })

  test('refuses a sign-in sent with a change', () => {
    mockStatus.mockReturnValue(readOnlyStatus)
    expect(
      run('mutation { refreshSession addAgendaItem(newAgendaItem: {}) { __typename } }')
    ).toHaveBeenCalled()
  })

  test('leaves super users, on the private schema, alone', () => {
    mockStatus.mockReturnValue(readOnlyStatus)
    expect(
      run('mutation { addAgendaItem(newAgendaItem: {}) { __typename } }', 'su')
    ).not.toHaveBeenCalled()
  })

  test('does nothing while the instance isn’t read-only', () => {
    mockStatus.mockReturnValue({...readOnlyStatus, readOnly: false})
    expect(
      run('mutation { addAgendaItem(newAgendaItem: {}) { __typename } }')
    ).not.toHaveBeenCalled()
  })
})
