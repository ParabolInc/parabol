import {type InviteeDirectory, makeInviteeDirectory} from '../inviteeDirectory'
import {
  buildInviteeOptions,
  describeInviteeOption,
  type InviteeOption,
  isOptionEnabled,
  rankInviteePeople
} from '../inviteeOptions'

const members = [
  {id: 'hana', preferredName: 'Hana Bhattacharya', email: 'hbhattacharya@kestrel.io'},
  {id: 'hanif', preferredName: 'Hanif Bhatti', email: 'hbhatti@kestrel.io'},
  {id: 'hannah', preferredName: 'Hannah Brooks', email: 'hbrooks@kestrel.io'},
  {id: 'tomasz', preferredName: 'Tomasz Kowalczyk', email: 'tkowalczyk@kestrel.io'},
  {id: 'wen', preferredName: 'Wen Chen', email: 'wchen@kestrel.io'},
  {id: 'wendell', preferredName: 'Wendell Shaw', email: 'wshaw@kestrel.io'},
  {id: 'marisol', preferredName: 'Marisol Fonseca', email: 'mfonseca@kestrel.io'},
  {id: 'me', preferredName: 'Me', email: 'me@kestrel.io'}
].map((member) => ({...member, picture: ''}))

const defaultTeams = [
  {
    id: 'market-data-eng',
    name: 'Market Data Eng',
    memberIds: ['marisol', 'tomasz', 'wen', 'hana', 'me']
  },
  {id: 'alpha-research', name: 'Alpha Research', memberIds: ['hanif', 'wen']},
  {id: 'infra-on-call', name: 'Infra On-call', memberIds: ['hanif']}
]

const defaultPartners = [
  {userId: 'wen', lastMetAt: '2026-11-24T10:00:00.000Z', meetingType: 'teamPrompt' as const},
  {userId: 'tomasz', lastMetAt: '2026-11-20T10:00:00.000Z', meetingType: 'retrospective' as const}
]

const makeKestrel = (
  overrides: {partners?: typeof defaultPartners; teams?: typeof defaultTeams} = {}
) =>
  makeInviteeDirectory({
    orgName: 'Kestrel',
    viewerId: 'me',
    approvedDomains: [],
    members,
    partners: overrides.partners ?? defaultPartners,
    teams: overrides.teams ?? defaultTeams
  })

const kestrel = makeKestrel()

const withPartners = (count: number): InviteeDirectory => {
  const crowd = Array.from({length: count}, (_, index) => ({
    id: `crowd-${index}`,
    preferredName: `Crowd Member ${index}`,
    email: `crowd${index}@kestrel.io`,
    picture: ''
  }))
  return makeInviteeDirectory({
    orgName: 'Kestrel',
    viewerId: 'me',
    approvedDomains: [],
    members: [...members, ...crowd],
    partners: crowd.map(({id}, index) => ({
      userId: id,
      lastMetAt: new Date(Date.UTC(2026, 10, 24 - index)).toISOString(),
      meetingType: 'retrospective' as const
    })),
    teams: defaultTeams
  })
}

const withNoPartnersOrTeams = () => makeKestrel({partners: [], teams: []})

type BuildInput = Parameters<typeof buildInviteeOptions>[0]
const build = (overrides: Partial<BuildInput> = {}) =>
  buildInviteeOptions({
    query: '',
    directory: kestrel,
    draftEmails: new Set(),
    teamEmails: new Set(),
    targetTeamId: null,
    capacity: 50,
    showAllPartners: false,
    ...overrides
  })

const names = (people: {name: string}[]) => people.map(({name}) => name)
const emailsOf = (...personNames: string[]) =>
  new Set(
    personNames.map((personName) => kestrel.people.find(({name}) => name === personName)!.email)
  )
const nameOf = (option: InviteeOption) => (option.kind === 'person' ? option.person.name : '')
const meta = (option: InviteeOption) => {
  if (option.kind !== 'person') return ''
  return option.meta
}
const findOption = (
  result: ReturnType<typeof build>,
  predicate: (option: InviteeOption) => boolean
) => result.sections.flatMap(({options}) => options).find(predicate)!
const team = (result: ReturnType<typeof build>, teamName: string) =>
  findOption(result, (option) => option.kind === 'team' && option.team.name === teamName)
const person = (result: ReturnType<typeof build>, personName: string) =>
  findOption(
    result,
    (option) => option.kind === 'person' && option.person.name === personName
  ) as Extract<InviteeOption, {kind: 'person'}>
const teamNames = (result: ReturnType<typeof build>) =>
  result.sections
    .flatMap(({options}) => options)
    .flatMap((option) => (option.kind === 'team' ? [option.team.name] : []))

test('ranking puts closer people first', () => {
  expect(names(rankInviteePeople('han', kestrel))).toEqual([
    'Hana Bhattacharya',
    'Hanif Bhatti',
    'Hannah Brooks'
  ])
  expect(names(rankInviteePeople('kowalcyk', kestrel))[0]).toBe('Tomasz Kowalczyk')
  expect(names(rankInviteePeople('hana bhatach', kestrel))[0]).toBe('Hana Bhattacharya')
  expect(rankInviteePeople('zelda', kestrel)).toEqual([])
})

test('empty query suggests partners, then your teams', () => {
  const {sections} = build({query: ''})
  expect(sections.map(({title}) => title)).toEqual([
    'Met with you in the last 30 days',
    'Your teams'
  ])
  expect(sections[0]!.options.map(meta)).toEqual(['Standup · Nov 24', 'Retrospective · Nov 20'])
  expect(sections.map(({count}) => count)).toEqual([2, 3])
})

test('more than 8 partners ends with a show-more row', () => {
  const {sections} = build({query: '', directory: withPartners(13)})
  expect(sections[0]!.options).toHaveLength(9)
  expect(sections[0]!.options.at(-1)).toMatchObject({kind: 'showMore', count: 5})
  expect(
    build({query: '', directory: withPartners(13), showAllPartners: true}).sections[0]!.options
  ).toHaveLength(13)
})

test('team rows count what is added and what fits', () => {
  expect(
    team(build({query: '', draftEmails: emailsOf('Marisol Fonseca')}), 'Market Data Eng')
  ).toMatchObject({
    sub: '4 people · 1 added',
    actionLabel: 'Add 3 more',
    action: 'add',
    isDisabled: false
  })
  expect(
    team(
      build({
        query: '',
        draftEmails: emailsOf(
          'Marisol Fonseca',
          'Tomasz Kowalczyk',
          'Wen Chen',
          'Hana Bhattacharya'
        )
      }),
      'Market Data Eng'
    )
  ).toMatchObject({actionLabel: 'Remove all', action: 'remove'})
  expect(team(build({query: '', capacity: 2}), 'Market Data Eng')).toMatchObject({
    sub: '4 people · only 2 more fit',
    actionLabel: 'Add all',
    isDisabled: true
  })
  expect(
    team(build({query: '', teamEmails: emailsOf('Wen Chen'), capacity: null}), 'Alpha Research')
  ).toMatchObject({
    sub: '2 people · 1 already on this team',
    actionLabel: 'Add all',
    isDisabled: false
  })
  expect(
    team(build({query: '', teamEmails: emailsOf('Hanif Bhatti'), capacity: null}), 'Infra On-call')
  ).toMatchObject({actionLabel: 'Add all', isDisabled: true})
  expect(teamNames(build({query: '', targetTeamId: 'market-data-eng', capacity: null}))).toEqual([
    'Alpha Research',
    'Infra On-call'
  ])
})

test('a full field disables people', () => {
  expect(person(build({query: 'han', capacity: 0}), 'Hannah Brooks').disabledReason).toBe(
    'No room left'
  )
})

test('the dialog leaves teammates out of suggestions and dims them in search', () => {
  const dialog = {teamEmails: emailsOf('Wen Chen'), capacity: null}
  expect(build({...dialog, query: ''}).sections[0]!.options.map(nameOf)).toEqual([
    'Tomasz Kowalczyk'
  ])
  const search = build({...dialog, query: 'wen'}).sections[0]!.options
  expect(search.map(nameOf)).toEqual(['Wendell Shaw', 'Wen Chen'])
  expect(search[1]).toMatchObject({disabledReason: 'Already on this team'})
})

test('typed emails', () => {
  expect(build({query: 'tkowalczyk@kestrel.io'}).sections[0]!.options.map(nameOf)).toEqual([
    'Tomasz Kowalczyk'
  ])
  const near = build({query: 'tkowalczk@kestrel.io'})
  expect(near.sections.map(({title}) => title)).toEqual(['Did you mean', 'Email'])
  expect(near.sections[0]!.options[0]).toMatchObject({meta: 'Closest match'})
  expect(near.sections[1]!.options[0]).toMatchObject({
    kind: 'email',
    sub: 'No one at Kestrel has this address'
  })
  expect(build({query: 'pat.ng@vendor.co'}).sections[0]!.options[0]).toMatchObject({
    sub: 'Outside Kestrel'
  })
  expect(build({query: 'r.okoye@kestrel.io'}).sections[0]!.options[0]).toMatchObject({
    sub: 'Not on Parabol yet'
  })
  expect(build({query: 'zz@'}).emptyText).toBe('Finish the email address to invite someone new.')
})

test('empty states', () => {
  expect(build({query: 'zelda'}).emptyText).toBe(
    'No one at Kestrel matches “zelda”. Type their email to invite them.'
  )
  expect(build({query: '', directory: withNoPartnersOrTeams()}).emptyText).toBe(
    'No suggestions yet. People you meet with in Parabol will show up here.'
  )
})

test('person meta in search follows its priority', () => {
  const result = build({query: 'han'})
  expect(person(result, 'Hana Bhattacharya').meta).toBe('On Market Data Eng')
  expect(person(result, 'Hanif Bhatti').meta).toBe('On 2 of your teams')
  expect(person(result, 'Hannah Brooks').meta).toBe('')
  expect(person(build({query: 'wen'}), 'Wen Chen').meta).toBe('Standup · Nov 24')
})

test('search lists matching teams after people', () => {
  const result = build({query: 'alp'})
  expect(result.sections.map(({title}) => title)).toEqual(['Your teams'])
  expect(teamNames(result)).toEqual(['Alpha Research'])
})

test('describeInviteeOption', () => {
  expect(describeInviteeOption(person(build({query: 'han'}), 'Hana Bhattacharya'))).toBe(
    'adds Hana Bhattacharya'
  )
  expect(describeInviteeOption(team(build({query: ''}), 'Market Data Eng'))).toBe(
    'adds 4 people from Market Data Eng'
  )
  expect(describeInviteeOption(build({query: 'pat.ng@vendor.co'}).sections[0]!.options[0]!)).toBe(
    'invites pat.ng@vendor.co by email'
  )
})

test('a name with a wrong or swapped letter still matches', () => {
  const withNearNames = makeInviteeDirectory({
    orgName: 'Kestrel',
    viewerId: 'me',
    approvedDomains: [],
    members: [
      ...members,
      {id: 'riley', preferredName: 'Riley Kowalski', email: 'rkowalski@kestrel.io', picture: ''},
      {id: 'avery', preferredName: 'Avery Chen', email: 'achen@kestrel.io', picture: ''}
    ],
    partners: defaultPartners,
    teams: defaultTeams
  })
  expect(names(rankInviteePeople('kowalsky', kestrel))).toContain('Tomasz Kowalczyk')
  expect(names(rankInviteePeople('kowalksi', withNearNames))[0]).toBe('Riley Kowalski')
  expect(names(rankInviteePeople('kowalsky', withNearNames))).toEqual(
    expect.arrayContaining(['Riley Kowalski', 'Tomasz Kowalczyk'])
  )
  expect(names(rankInviteePeople('avary', withNearNames))).toEqual(['Avery Chen'])
  expect(rankInviteePeople('zelda', withNearNames)).toEqual([])
  expect(names(rankInviteePeople('han', withNearNames))).toEqual([
    'Hana Bhattacharya',
    'Hanif Bhatti',
    'Hannah Brooks'
  ])
})

test('an incomplete address lists members whose email starts with it', () => {
  const result = build({query: 'tkowalczyk@kes'})
  expect(result.sections.map(({title}) => title)).toEqual(['People at Kestrel'])
  expect(result.sections[0]!.options.map(nameOf)).toEqual(['Tomasz Kowalczyk'])
  expect(result.emptyText).toBeNull()
  expect(build({query: 'TKowalczyk@'}).sections[0]!.options.map(nameOf)).toEqual([
    'Tomasz Kowalczyk'
  ])
})

test('team rows at or over the limit say there is no room', () => {
  expect(team(build({query: '', capacity: 0}), 'Market Data Eng')).toMatchObject({
    sub: '4 people · No room left',
    isDisabled: true
  })
  expect(team(build({query: '', capacity: -3}), 'Market Data Eng')).toMatchObject({
    sub: '4 people · No room left',
    isDisabled: true
  })
  const allAdded = emailsOf('Marisol Fonseca', 'Tomasz Kowalczyk', 'Wen Chen', 'Hana Bhattacharya')
  expect(
    team(build({query: '', capacity: -3, draftEmails: allAdded}), 'Market Data Eng')
  ).toMatchObject({sub: '4 people · 4 added', actionLabel: 'Remove all', isDisabled: false})
})

test('the email option stays enabled when the field is full', () => {
  const option = build({query: 'pat.ng@vendor.co', capacity: 0}).sections[0]!.options[0]!
  expect(option.kind).toBe('email')
  expect(isOptionEnabled(option)).toBe(true)
})

test('the email option sub matches the check the chip will get', () => {
  const approvedOnly = makeInviteeDirectory({
    orgName: 'Kestrel',
    viewerId: 'me',
    approvedDomains: ['kestrel.io'],
    members: [
      ...members,
      {id: 'lab', preferredName: 'Lab Member', email: 'lab@kestrel-labs.io', picture: ''}
    ],
    partners: [],
    teams: []
  })
  const sub = (query: string) =>
    build({query, directory: approvedOnly}).sections.at(-1)!.options[0]!
  expect(sub('new@kestrel-labs.io')).toMatchObject({kind: 'email', sub: 'Outside Kestrel'})
  expect(sub('new.person@kestrel.io')).toMatchObject({kind: 'email', sub: 'Not on Parabol yet'})
})

test('show more points at the first hidden partner', () => {
  const {sections} = build({query: '', directory: withPartners(13)})
  expect(sections[0]!.options.at(-1)).toMatchObject({
    kind: 'showMore',
    firstHiddenId: 'person-crowd-8'
  })
})
