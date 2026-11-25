import {makeInviteeDirectory} from '../inviteeDirectory'
import getInviteeNoteLines from '../inviteeNoteLines'

const kestrel = makeInviteeDirectory({
  orgName: 'Kestrel',
  viewerId: 'me',
  approvedDomains: [],
  members: [{id: 'me', preferredName: 'Me', email: 'me@kestrel.io', picture: ''}],
  partners: [],
  teams: []
})
const drafts = (...emails: string[]) => emails.map((email) => ({email, rejection: null}))

test('three or more of a kind share one line; fewer stay per address', () => {
  const lines = getInviteeNoteLines(
    drafts('a@kestrel.io', 'pat@vendor.co', 'b@kestrel.io', 'c@kestrel.io', 'bob'),
    [{email: 'old@kestrel.io', message: 'Already on this team.'}],
    kestrel
  )
  expect(lines.map(({lead, message}) => `${lead} ${message}`)).toEqual([
    'old@kestrel.io Already on this team.',
    "3 addresses aren't on Parabol yet and will get an email invite.",
    'pat@vendor.co is outside Kestrel and will get an email invite.'
  ])
})

test('without a directory only server notes show', () => {
  expect(getInviteeNoteLines(drafts('a@kestrel.io'), [], null)).toEqual([])
})
