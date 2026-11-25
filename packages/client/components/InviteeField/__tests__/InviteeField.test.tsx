import './installHappyDom'
import {act, Suspense} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import useTeamInviteeDrafts from '../../../hooks/useTeamInviteeDrafts'
import {formatNewTeamInviteeExcess} from '../../../shared/teamInvitees'
import {type InviteeDirectory, makeInviteeDirectory} from '../../../utils/inviteeDirectory'
import InviteeField from '../InviteeField'

const kestrel = makeInviteeDirectory({
  orgName: 'Kestrel',
  viewerId: 'me',
  approvedDomains: [],
  members: [
    {id: 'tomasz', preferredName: 'Tomasz Kowalczyk', email: 'tkowalczyk@kestrel.io', picture: ''},
    {id: 'wen', preferredName: 'Wen Chen', email: 'wchen@kestrel.io', picture: ''},
    {
      id: 'hana',
      preferredName: 'Hana Bhattacharya',
      email: 'hbhattacharya@kestrel.io',
      picture: ''
    },
    {id: 'me', preferredName: 'Me', email: 'me@kestrel.io', picture: ''}
  ],
  partners: [{userId: 'wen', lastMetAt: '2026-11-20T00:00:00Z', meetingType: 'retrospective'}],
  teams: [{id: 'mde', name: 'Market Data Eng', memberIds: ['me', 'wen', 'hana']}]
})
const IDLE_FOOTER = 'Type a name to search everyone at Kestrel, or type an email.'

let root: Root
let container: HTMLElement
let invitees: ReturnType<typeof useTeamInviteeDrafts>
const onSubmit = jest.fn()

const NO_TEAM_EMAILS: readonly string[] = []

type FieldProps = {
  directory: InviteeDirectory | null
  autoFocus?: boolean
  limit?: number
}

const Field = ({directory, autoFocus, limit = 50}: FieldProps) => {
  invitees = useTeamInviteeDrafts([])
  return (
    <InviteeField
      invitees={invitees}
      directory={directory}
      teamEmails={NO_TEAM_EMAILS}
      targetTeamId={null}
      capacity={limit - invitees.drafts.length}
      labelledBy='hint'
      onSubmit={onSubmit}
      autoFocus={autoFocus}
    />
  )
}

const mount = (
  directory: InviteeDirectory | null = kestrel,
  extra: Omit<FieldProps, 'directory'> = {}
) => {
  act(() => {
    root.render(<Field directory={directory} {...extra} />)
  })
}
const getInput = () => container.querySelector('input')!
const focusInput = () => act(() => getInput().focus())
const pressKey = (key: string) =>
  act(() => {
    getInput().dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}))
  })
const typeText = (value: string) =>
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      getInput(),
      value
    )
    getInput().dispatchEvent(new Event('input', {bubbles: true}))
  })
const getOption = (text: string) =>
  [...document.querySelectorAll('[role=option]')].find((option) =>
    option.textContent?.startsWith(text)
  )!
const clickOption = (text: string) => {
  const option = getOption(text)
  act(() => {
    option.dispatchEvent(new PointerEvent('pointermove', {bubbles: true}))
    option.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  act(() => {
    getOption(text).dispatchEvent(new PointerEvent('pointermove', {bubbles: true}))
  })
}
const getFooter = () => document.querySelector('[role=listbox]')!.parentElement!.lastElementChild!
const getDraftEmails = () => invitees.drafts.map(({email}) => email)
const getButton = (label: string) =>
  [...container.querySelectorAll('button')].find((button) => button.textContent === label)!

beforeEach(() => {
  onSubmit.mockClear()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

test('an empty query highlights nothing until ArrowDown, and the footer describes the row', () => {
  mount()
  focusInput()
  expect(getInput().getAttribute('aria-expanded')).toBe('true')
  expect(getInput().getAttribute('aria-activedescendant')).toBeNull()
  expect(getFooter().textContent).toBe(IDLE_FOOTER)
  pressKey('ArrowDown')
  expect(getInput().getAttribute('aria-activedescendant')).toBe(getOption('Wen Chen').id)
  expect(getFooter().querySelector('kbd')?.textContent).toBe('Enter')
  expect(getFooter().lastElementChild?.textContent).toBe('adds Wen Chen')
  pressKey('Enter')
  expect(getDraftEmails()).toEqual(['wchen@kestrel.io'])
  expect(getFooter().lastElementChild?.textContent).toBe('removes Wen Chen')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('Enter submits after a clicked pick instead of undoing it', () => {
  mount()
  focusInput()
  clickOption('Wen Chen')
  expect(getDraftEmails()).toEqual(['wchen@kestrel.io'])
  expect(getFooter().textContent).toBe(IDLE_FOOTER)
  pressKey('Enter')
  expect(onSubmit).toHaveBeenCalledTimes(1)
  expect(getDraftEmails()).toEqual(['wchen@kestrel.io'])
  clickOption('Market Data Eng')
  expect(getDraftEmails()).toEqual(['wchen@kestrel.io', 'hbhattacharya@kestrel.io'])
  pressKey('Enter')
  expect(onSubmit).toHaveBeenCalledTimes(2)
  expect(getDraftEmails()).toEqual(['wchen@kestrel.io', 'hbhattacharya@kestrel.io'])
})

test('a comma-committed typo closes the popover so Keep it is reachable', () => {
  mount()
  focusInput()
  typeText('tkowalczk@kestrel.io')
  pressKey(',')
  expect(invitees.drafts[0]?.rejection?.status).toBe('closeToMember')
  expect(getInput().getAttribute('aria-expanded')).toBe('false')
  expect(document.querySelector('[role=listbox]')).toBeNull()
  expect(getButton('Use Tomasz Kowalczyk (tkowalczyk@kestrel.io)')).toBeDefined()
  act(() => getButton('Keep it').click())
  expect(invitees.drafts[0]?.rejection).toBeNull()
  expect(container.textContent).toContain(
    "tkowalczk@kestrel.io isn't on Parabol yet and will get an email invite."
  )
  typeText('w')
  expect(getInput().getAttribute('aria-expanded')).toBe('true')
})

test('picking the email option under Did you mean keeps the address unflagged', () => {
  mount()
  focusInput()
  typeText('tkowalczk@kestrel.io')
  expect(getInput().getAttribute('aria-activedescendant')).toBe(getOption('Tomasz Kowalczyk').id)
  pressKey('ArrowDown')
  pressKey('Enter')
  expect(invitees.drafts).toEqual([{email: 'tkowalczk@kestrel.io', rejection: null}])
  expect(getInput().getAttribute('aria-expanded')).toBe('false')
})

test('with a directory, chips show a name or a mail icon and box mousedown keeps focus', () => {
  mount()
  focusInput()
  typeText('wchen@kestrel.io pat.ng@vendor.co ')
  const [member, email] = [...container.querySelectorAll('ul.contents > li')]
  expect(member?.textContent).toBe('Wen Chen wchen@kestrel.io')
  expect(member?.getAttribute('title')).toBe('wchen@kestrel.io')
  expect(email?.querySelectorAll('svg')).toHaveLength(2)
  const mouseDown = new MouseEvent('mousedown', {bubbles: true, cancelable: true})
  act(() => {
    email?.querySelector('span')?.dispatchEvent(mouseDown)
  })
  expect(mouseDown.defaultPrevented).toBe(true)
})

test('without a directory, the field is the email box it was', () => {
  mount(null)
  focusInput()
  expect(getInput().getAttribute('role')).toBeNull()
  expect(document.querySelector('[role=listbox]')).toBeNull()
  typeText('pat.ng@vendor.co ')
  expect(getDraftEmails()).toEqual(['pat.ng@vendor.co'])
  const chip = container.querySelector('ul.contents > li')!
  expect(chip.querySelectorAll('svg')).toHaveLength(1)
  const mouseDown = new MouseEvent('mousedown', {bubbles: true, cancelable: true})
  act(() => {
    chip.querySelector('span')?.dispatchEvent(mouseDown)
  })
  expect(mouseDown.defaultPrevented).toBe(false)
  typeText('hana')
  act(() => getInput().blur())
  expect(getDraftEmails()).toEqual(['pat.ng@vendor.co', 'hana'])
})

let pendingLoad: Promise<void> | null = null
const LoadGate = () => {
  if (pendingLoad) throw pendingLoad
  return null
}
const SuspendingField = ({tick}: {tick: number}) => {
  invitees = useTeamInviteeDrafts([])
  const fieldProps = {
    invitees,
    teamEmails: NO_TEAM_EMAILS,
    targetTeamId: null,
    capacity: 50,
    labelledBy: `hint-${tick}`,
    onSubmit
  }
  return (
    <Suspense fallback={<InviteeField {...fieldProps} directory={null} />}>
      <LoadGate />
      <InviteeField {...fieldProps} directory={kestrel} />
    </Suspense>
  )
}

test('the email check survives the field suspending again', async () => {
  act(() => {
    root.render(<SuspendingField tick={0} />)
  })
  expect(invitees.hasEmailCheck).toBe(true)
  let finishLoad = () => {}
  pendingLoad = new Promise<void>((resolve) => {
    finishLoad = resolve
  })
  act(() => {
    root.render(<SuspendingField tick={1} />)
  })
  expect(invitees.hasEmailCheck).toBe(false)
  const load = pendingLoad
  pendingLoad = null
  await act(async () => {
    finishLoad()
    await load
  })
  expect(invitees.hasEmailCheck).toBe(true)
  act(() => {
    invitees.addEmails('tkowalczk@kestrel.io')
  })
  expect(invitees.drafts[0]?.rejection?.status).toBe('closeToMember')
})

test('autofocus does not open the dropdown; a press in the field or a later focus does', () => {
  mount(kestrel, {autoFocus: true})
  expect(document.activeElement).toBe(getInput())
  expect(getInput().getAttribute('aria-expanded')).toBe('false')
  act(() => {
    getInput().parentElement!.dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  expect(getInput().getAttribute('aria-expanded')).toBe('true')
  act(() => getInput().blur())
  expect(getInput().getAttribute('aria-expanded')).toBe('false')
  focusInput()
  expect(getInput().getAttribute('aria-expanded')).toBe('true')
})

test('Use and Keep it return focus to the input without opening the dropdown', () => {
  mount()
  focusInput()
  typeText('tkowalczk@kestrel.io')
  pressKey(',')
  const useButton = getButton('Use Tomasz Kowalczyk (tkowalczyk@kestrel.io)')
  act(() => useButton.focus())
  act(() => useButton.click())
  expect(getDraftEmails()).toEqual(['tkowalczyk@kestrel.io'])
  expect(document.activeElement).toBe(getInput())
  expect(getInput().getAttribute('aria-expanded')).toBe('false')
  typeText('wchn@kestrel.io')
  pressKey(',')
  const keepButton = getButton('Keep it')
  act(() => keepButton.focus())
  act(() => keepButton.click())
  expect(document.activeElement).toBe(getInput())
  expect(getInput().getAttribute('aria-expanded')).toBe('false')
  act(() => getInput().blur())
  focusInput()
  expect(getInput().getAttribute('aria-expanded')).toBe('true')
})

test('Show more highlights the first newly shown person', () => {
  const crowd = Array.from({length: 10}, (_, index) => ({
    id: `crowd-${index}`,
    preferredName: `Crowd Member ${index}`,
    email: `crowd${index}@kestrel.io`,
    picture: ''
  }))
  mount(
    makeInviteeDirectory({
      orgName: 'Kestrel',
      viewerId: 'me',
      approvedDomains: [],
      members: crowd,
      partners: crowd.map(({id}, index) => ({
        userId: id,
        lastMetAt: new Date(Date.UTC(2026, 10, 24 - index)).toISOString(),
        meetingType: 'retrospective' as const
      })),
      teams: []
    })
  )
  focusInput()
  act(() => {
    getOption('Show 2 more').dispatchEvent(new MouseEvent('click', {bubbles: true}))
  })
  expect(getInput().getAttribute('aria-activedescendant')).toBe(getOption('Crowd Member 8').id)
})

test('three or more notes of a kind become one line, under the over-limit message', () => {
  mount(kestrel, {limit: 4})
  focusInput()
  typeText('a@vendor.co b@vendor.co c@vendor.co new1@kestrel.io new2@kestrel.io ')
  const notes = [...container.querySelectorAll('ul:not(.contents) > li')].map(
    (line) => line.textContent
  )
  expect(notes).toEqual([
    '3 addresses are outside Kestrel and will get an email invite.',
    "new1@kestrel.io isn't on Parabol yet and will get an email invite.",
    "new2@kestrel.io isn't on Parabol yet and will get an email invite."
  ])
  const status = container.querySelector('[role=status]')!
  expect(status.textContent).toBe(formatNewTeamInviteeExcess(1))
  const messages = container.querySelector('ul:not(.contents)')!
  expect(status.compareDocumentPosition(messages) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})
