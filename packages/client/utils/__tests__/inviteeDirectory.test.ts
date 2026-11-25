import {
  checkInviteeEmail,
  editDistance,
  isCloseLocalPart,
  makeInviteeDirectory
} from '../inviteeDirectory'

const tomasz = {id: 'tomasz', name: 'Tomasz Kowalczyk', email: 'tkowalczyk@kestrel.io', picture: ''}
const jia = {id: 'jia', name: 'Jia Lu', email: 'jlu@kestrel.io', picture: ''}

const makeDirectory = ({approvedDomains = [] as string[]} = {}) =>
  makeInviteeDirectory({
    orgName: 'Kestrel',
    viewerId: 'me',
    approvedDomains,
    members: [
      {
        id: 'tomasz',
        preferredName: 'Tomasz Kowalczyk',
        email: 'tkowalczyk@kestrel.io',
        picture: ''
      },
      {id: 'jia', preferredName: 'Jia Lu', email: 'jlu@kestrel.io', picture: ''},
      {id: 'me', preferredName: 'Me', email: 'me@kestrel.io', picture: ''}
    ],
    partners: [
      {userId: 'me', lastMetAt: '2026-11-20T00:00:00.000Z', meetingType: 'retrospective'},
      {userId: 'jia', lastMetAt: '2026-11-20T00:00:00.000Z', meetingType: 'retrospective'},
      {userId: 'stranger', lastMetAt: '2026-11-20T00:00:00.000Z', meetingType: 'action'}
    ],
    teams: [{id: 'team', name: 'Market Data Eng', memberIds: ['me', 'tomasz', 'jia']}]
  })

test('editDistance', () => expect(editDistance('tkowalczk', 'tkowalczyk')).toBe(1))

test('isCloseLocalPart is stricter for short names', () => {
  expect(isCloseLocalPart('tkowalczk', 'tkowalczyk')).toBe(true)
  expect(isCloseLocalPart('jlee', 'jlu')).toBe(false)
  expect(isCloseLocalPart('jle', 'jlu')).toBe(true)
  expect(isCloseLocalPart('jlu', 'jlu')).toBe(false)
})

test('checkInviteeEmail', () => {
  const kestrel = makeDirectory()
  expect(checkInviteeEmail(' TKowalczyk@Kestrel.io', kestrel)).toEqual({
    kind: 'member',
    person: tomasz
  })
  expect(checkInviteeEmail('tkowalczk@kestrel.io', kestrel)).toEqual({
    kind: 'closeToMember',
    person: tomasz,
    message: "isn't anyone at Kestrel."
  })
  expect(checkInviteeEmail('r.okoye@kestrel.io', kestrel)).toEqual({
    kind: 'newToParabol',
    message: "isn't on Parabol yet and will get an email invite."
  })
  expect(checkInviteeEmail('pat.ng@vendor.co', kestrel)).toEqual({
    kind: 'outsideOrg',
    message: 'is outside Kestrel and will get an email invite.'
  })
  expect(checkInviteeEmail('tkowalczk@vendor.co', kestrel).kind).toBe('outsideOrg')
})

test('approved domains refuse off-list addresses before anything else', () => {
  const kestrel = makeDirectory({approvedDomains: ['kestrel.io']})
  expect(checkInviteeEmail('pat.ng@vendor.co', kestrel)).toEqual({
    kind: 'notApproved',
    message:
      'Kestrel only accepts kestrel.io addresses. Ask your account admin or support@parabol.co to approve more.'
  })
  expect(
    checkInviteeEmail('ops@eu.kestrel.io', makeDirectory({approvedDomains: ['*.kestrel.io']})).kind
  ).toBe('newToParabol')
})

test('makeInviteeDirectory leaves the viewer out', () => {
  const kestrel = makeDirectory()
  expect(kestrel.people.map(({email}) => email)).toEqual([tomasz.email, jia.email])
  expect(kestrel.partners.map(({userId}) => userId)).toEqual(['jia'])
  expect(kestrel.teams[0]!.memberIds).toEqual(['tomasz', 'jia'])
  expect(kestrel.personByEmail.get('jlu@kestrel.io')).toEqual(jia)
  expect(kestrel.personById.get('tomasz')).toEqual(tomasz)
})

test('domains include member domains and approved domains', () => {
  const kestrel = makeDirectory({approvedDomains: ['*.eu.example.com', 'pat@vendor.co']})
  expect([...kestrel.domains].sort()).toEqual(['eu.example.com', 'kestrel.io', 'vendor.co'])
})
