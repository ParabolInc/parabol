/* eslint-env jest */
import parseEmailAddressList from '../parseEmailAddressList'

const getAddressStr = (res) => res && res.parsedInvitees.map((val) => val.address).join(', ')

describe('parseEmailAddressList', () => {
  it('validates a simple single email', () => {
    const str = 'a@a.co'
    const res = parseEmailAddressList(str)
    expect(getAddressStr(res)).toEqual(str)
  })
  it('validates a trailing comma and trailing space', () => {
    const str = 'a@a.co, '
    const res = parseEmailAddressList(str)
    expect(getAddressStr(res)).toEqual('a@a.co')
  })
  it('validates 2 emails separated by a newline and comma', () => {
    const str = 'a@a.co,\nb@b.co'
    const res = parseEmailAddressList(str)
    expect(getAddressStr(res)).toEqual('a@a.co, b@b.co')
  })
  it('validates 2 emails separated by a newline', () => {
    const str = 'a@a.co\nb@b.co'
    const res = parseEmailAddressList(str)
    expect(getAddressStr(res)).toEqual('a@a.co, b@b.co')
  })
  it('validates 2 emails separated by a newline and semicolon', () => {
    const str = 'a@a.co;\nb@b.co'
    const res = parseEmailAddressList(str)
    expect(getAddressStr(res)).toEqual('a@a.co, b@b.co')
  })
})
