import '../../../../../components/InviteeField/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import useTeamInviteeDrafts from '../../../../../hooks/useTeamInviteeDrafts'
import {checkInviteeEmail, makeInviteeDirectory} from '../../../../../utils/inviteeDirectory'
import NewTeamFormInvitees from '../NewTeamFormInvitees'

let root: Root
let container: HTMLElement
let invitees: ReturnType<typeof useTeamInviteeDrafts>

const Form = () => {
  invitees = useTeamInviteeDrafts([])
  return <NewTeamFormInvitees invitees={invitees} orgId={null} onSubmit={() => {}} />
}

const kestrel = makeInviteeDirectory({
  orgName: 'Kestrel',
  viewerId: 'me',
  approvedDomains: [],
  members: [{id: 'me', preferredName: 'Me', email: 'me@kestrel.io', picture: ''}],
  partners: [],
  teams: []
})

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

test('the hint mentions names only when the field can search people', () => {
  act(() => {
    root.render(<Form />)
  })
  const hint = () => container.querySelector('p')!.textContent
  expect(hint()).toBe('Invite others to your new team. Invites expire in 30 days.')
  act(() => {
    invitees.setEmailCheck((email) => checkInviteeEmail(email, kestrel))
  })
  expect(hint()).toBe('Add people by name or email.')
})
