import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {formatNewTeamInviteeExcess, formatUnfinishedInvitee} from '../../shared/teamInvitees'
import {checkInviteeEmail, makeInviteeDirectory} from '../../utils/inviteeDirectory'
import useTeamInviteeDrafts, {isDraftReady} from '../useTeamInviteeDrafts'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: HTMLElement
let drafts: ReturnType<typeof useTeamInviteeDrafts>

const Probe = () => {
  drafts = useTeamInviteeDrafts([])
  return null
}

const makeCheck = (approvedDomains: string[] = [], orgName = 'Kestrel') => {
  const directory = makeInviteeDirectory({
    orgName,
    viewerId: 'me',
    approvedDomains,
    members: [
      {
        id: 'tomasz',
        preferredName: 'Tomasz Kowalczyk',
        email: 'tkowalczyk@kestrel.io',
        picture: ''
      },
      {id: 'me', preferredName: 'Me', email: 'me@kestrel.io', picture: ''}
    ],
    partners: [],
    teams: []
  })
  return (email: string) => checkInviteeEmail(email, directory)
}

const otherOrgCheck = () =>
  makeInviteeDirectory({
    orgName: 'Other',
    viewerId: 'me',
    approvedDomains: [],
    members: [{id: 'me', preferredName: 'Me', email: 'me@other.com', picture: ''}],
    partners: [],
    teams: []
  })

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    IS_REACT_ACT_ENVIRONMENT: true
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<Probe />)
  })
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

test('without a check, drafts behave as today', () => {
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.addEmails('bob')
  })
  expect(drafts.drafts).toHaveLength(2)
  expect(isDraftReady(drafts.drafts[1]!)).toBe(false)
  expect(drafts.drafts.every(({rejection}) => rejection === null)).toBe(true)
})

test('a close address is held until kept or replaced', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io')
  })
  expect(drafts.drafts[0]!.rejection).toEqual({
    status: 'closeToMember',
    message: expect.any(String),
    suggestedEmail: 'tkowalczyk@kestrel.io',
    suggestedName: 'Tomasz Kowalczyk',
    origin: 'check'
  })
  expect(isDraftReady(drafts.drafts[0]!)).toBe(false)
  act(() => {
    drafts.keepDraft('tkowalczk@kestrel.io')
  })
  expect(isDraftReady(drafts.drafts[0]!)).toBe(true)
})

test('replacing a close address swaps in the suggestion', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.replaceDraft('tkowalczk@kestrel.io', 'tkowalczyk@kestrel.io')
  })
  expect(drafts.drafts.map(({email}) => email)).toEqual(['tkowalczyk@kestrel.io'])
  expect(drafts.drafts[0]!.rejection).toBeNull()
})

test('an off-list address is refused before sending', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck(['kestrel.io']))
  })
  act(() => {
    drafts.addEmails('pat.ng@vendor.co')
  })
  expect(drafts.drafts[0]!.rejection?.status).toBe('notApproved')
  expect(drafts.drafts[0]!.rejection?.origin).toBe('check')
})

test('a pasted address list resolves members', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('Tomasz Kowalczyk <tkowalczyk@kestrel.io>; "Ng, Pat" <pat.ng@vendor.co>')
  })
  expect(drafts.drafts.map(({email}) => email)).toEqual([
    'tkowalczyk@kestrel.io',
    'pat.ng@vendor.co'
  ])
  expect(drafts.drafts.every(({rejection}) => rejection === null)).toBe(true)
})

test('commitInput keeps a name in the input once a check is set', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.setInputValue('han')
  })
  act(() => {
    drafts.commitInput()
  })
  expect(drafts.drafts).toHaveLength(0)
  expect(drafts.inputValue).toBe('han')
})

test('setEmailCheck re-checks drafts', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io')
  })
  expect(drafts.drafts[0]!.rejection).not.toBeNull()
  const stableSetter = drafts.setEmailCheck
  act(() => {
    drafts.setEmailCheck((email) => checkInviteeEmail(email, otherOrgCheck()))
  })
  expect(drafts.setEmailCheck).toBe(stableSetter)
  expect(drafts.drafts[0]!.rejection).toBeNull()
})

test('a kept address stays clear after a re-check', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.keepDraft('tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  expect(drafts.drafts[0]!.rejection).toBeNull()
})

test('a server rejection survives a re-check', () => {
  act(() => {
    drafts.addEmails('bad@kestrel.io')
  })
  act(() => {
    drafts.applyResults([
      {email: 'bad@kestrel.io', status: 'undeliverable', message: 'No.', suggestedEmail: null}
    ] as Parameters<typeof drafts.applyResults>[0])
  })
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  expect(drafts.drafts[0]!.rejection?.origin).toBe('server')
  expect(drafts.drafts[0]!.rejection?.status).toBe('undeliverable')
})

test('copy helpers', () => {
  expect(formatNewTeamInviteeExcess(3)).toBe(
    'You can invite up to 50 people while creating a team. Remove 3, then invite them from the team page.'
  )
  expect(formatUnfinishedInvitee('han')).toBe(
    'Choose someone for “han” from the list, or type their email.'
  )
})

test('a kept address is still refused once the org only approves other domains', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.keepDraft('tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.setEmailCheck(makeCheck(['vendor.co']))
  })
  expect(drafts.drafts[0]!.rejection?.status).toBe('notApproved')
})

test('a replacement is checked like any other address', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('pat.ng@vendor.co')
  })
  act(() => {
    drafts.replaceDraft('pat.ng@vendor.co', 'tkowalczk@kestrel.io')
  })
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  expect(drafts.drafts[0]!.rejection?.status).toBe('closeToMember')
})

test('a malformed address is never checked, only marked invalid', () => {
  act(() => {
    drafts.addEmails('bob')
  })
  act(() => {
    drafts.setEmailCheck(makeCheck(['kestrel.io']))
  })
  act(() => {
    drafts.addEmails('bob@kestrel')
  })
  expect(drafts.drafts.map(({email}) => email)).toEqual(['bob', 'bob@kestrel'])
  expect(drafts.drafts.every(({rejection}) => rejection === null)).toBe(true)
  expect(drafts.drafts.some(isDraftReady)).toBe(false)
})

test('hasEmailCheck follows setEmailCheck', () => {
  expect(drafts.hasEmailCheck).toBe(false)
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  expect(drafts.hasEmailCheck).toBe(true)
  act(() => {
    drafts.setEmailCheck(null)
  })
  expect(drafts.hasEmailCheck).toBe(false)
})

test('a re-check that changes nothing keeps the same drafts', () => {
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  act(() => {
    drafts.addEmails('tkowalczk@kestrel.io pat.ng@vendor.co')
  })
  const before = drafts.drafts
  act(() => {
    drafts.setEmailCheck(makeCheck())
  })
  expect(drafts.drafts).toBe(before)
  act(() => {
    drafts.setEmailCheck(makeCheck(['kestrel.io']))
  })
  expect(drafts.drafts[0]).toBe(before[0])
  expect(drafts.drafts[1]).not.toBe(before[1])
})
