import stringScore from 'string-score'
import {normalizeEmail} from '../shared/emailAddress'
import {
  checkInviteeEmail,
  type DirectoryPerson,
  type DirectoryTeam,
  editDistance,
  type InviteeCheck,
  type InviteeDirectory
} from './inviteeDirectory'
import {MeetingTypeToReadable} from './meetings/lookups'
import plural from './plural'

export type InviteeOption =
  | {
      kind: 'person'
      id: string
      person: DirectoryPerson
      meta: string
      isAdded: boolean
      disabledReason: string | null
    }
  | {
      kind: 'team'
      id: string
      team: DirectoryTeam
      sub: string
      actionLabel: string
      action: 'add' | 'remove'
      emails: string[]
      isDisabled: boolean
    }
  | {kind: 'email'; id: string; email: string; sub: string}
  | {kind: 'showMore'; id: string; count: number; firstHiddenId: string}
export type InviteeOptionSection = {
  id: string
  title: string
  count: number | null
  options: InviteeOption[]
}
export type InviteeOptions = {sections: InviteeOptionSection[]; emptyText: string | null}

const FUZZINESS = 0.5
const MIN_FUZZY_SCORE = 0.5
const MIN_FUZZY_QUERY_LENGTH = 4
const PARTNERS_SHOWN = 8
const SEARCH_PEOPLE_LIMIT = 6
const SEARCH_TEAM_LIMIT = 2
const WORD_SPLITTER = /[\s.\-_]+/
const COMPLETE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const partnerDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC'
})

const getWords = (text: string) => text.toLowerCase().split(WORD_SPLITTER).filter(Boolean)

const hasEveryPrefix = (tokens: string[], words: string[]) =>
  tokens.every((token) => words.some((word) => word.startsWith(token)))

const isNearPrefix = (token: string, word: string) =>
  [token.length - 1, token.length, token.length + 1].some((length) => {
    if (length > word.length) return false
    const maxDistance = Math.min(token.length, length) < 6 ? 1 : 2
    return editDistance(token, word.slice(0, length)) <= maxDistance
  })

const hasEveryNearPrefix = (tokens: string[], words: string[]) =>
  tokens.every((token) =>
    words.some(
      (word) =>
        word.startsWith(token) ||
        (token.length >= MIN_FUZZY_QUERY_LENGTH && isNearPrefix(token, word))
    )
  )

const scorePerson = (query: string, tokens: string[], person: DirectoryPerson) => {
  const localPart = person.email.slice(0, person.email.lastIndexOf('@'))
  const words = [...getWords(person.name), ...getWords(localPart)]
  if (hasEveryPrefix(tokens, words)) return 2
  if (
    query.length >= MIN_FUZZY_QUERY_LENGTH &&
    stringScore(person.name, query, FUZZINESS) >= MIN_FUZZY_SCORE
  )
    return 1
  if (hasEveryNearPrefix(tokens, words)) return 1
  return 0
}

const getTier = (directory: InviteeDirectory) => {
  const partnerIds = new Set(directory.partners.map(({userId}) => userId))
  const teamMemberIds = new Set(directory.teams.flatMap(({memberIds}) => memberIds))
  return ({id}: DirectoryPerson) => (partnerIds.has(id) ? 0 : teamMemberIds.has(id) ? 1 : 2)
}

export const rankInviteePeople = (query: string, directory: InviteeDirectory) => {
  const trimmed = query.trim().toLowerCase()
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const tier = getTier(directory)
  return directory.people
    .map((person) => ({person, score: scorePerson(trimmed, tokens, person)}))
    .filter(({score}) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        tier(a.person) - tier(b.person) ||
        a.person.name.localeCompare(b.person.name)
    )
    .map(({person}) => person)
}

const rankByEmailStart = (query: string, directory: InviteeDirectory) => {
  const typed = normalizeEmail(query)
  const tier = getTier(directory)
  return directory.people
    .filter(({email}) => email.startsWith(typed))
    .sort((a, b) => tier(a) - tier(b) || a.name.localeCompare(b.name))
}

type BuildInput = {
  query: string
  directory: InviteeDirectory
  draftEmails: ReadonlySet<string>
  teamEmails: ReadonlySet<string>
  targetTeamId: string | null
  capacity: number | null
  showAllPartners: boolean
}

const makePersonOption = (
  person: DirectoryPerson,
  getMeta: (person: DirectoryPerson) => string,
  {draftEmails, teamEmails, capacity}: BuildInput
): Extract<InviteeOption, {kind: 'person'}> => {
  const isAdded = draftEmails.has(person.email)
  const disabledReason = teamEmails.has(person.email)
    ? 'Already on this team'
    : !isAdded && capacity !== null && capacity <= 0
      ? 'No room left'
      : null
  return {
    kind: 'person',
    id: `person-${person.id}`,
    person,
    meta: disabledReason ?? getMeta(person),
    isAdded,
    disabledReason
  }
}

const makeTeamOption = (
  team: DirectoryTeam,
  {directory, draftEmails, teamEmails, capacity}: BuildInput
): InviteeOption => {
  const members = team.memberIds.flatMap((id) => directory.personById.get(id) ?? [])
  const addable = members.filter(({email}) => !teamEmails.has(email))
  const added = addable.filter(({email}) => draftEmails.has(email))
  const remaining = addable.filter(({email}) => !draftEmails.has(email))
  const alreadyOnTeam = members.length - addable.length
  const isRemoving = remaining.length === 0 && added.length > 0
  const room = capacity === null ? null : Math.max(capacity, 0)
  const doesNotFit = !isRemoving && room !== null && remaining.length > room
  const sub = [
    `${members.length} ${plural(members.length, 'person', 'people')}`,
    added.length > 0 && `${added.length} added`,
    alreadyOnTeam > 0 && `${alreadyOnTeam} already on this team`,
    doesNotFit && (room === 0 ? 'No room left' : `only ${room} more fit`)
  ]
    .filter(Boolean)
    .join(' · ')
  return {
    kind: 'team',
    id: `team-${team.id}`,
    team,
    sub,
    action: isRemoving ? 'remove' : 'add',
    actionLabel: isRemoving
      ? 'Remove all'
      : added.length > 0
        ? `Add ${remaining.length} more`
        : 'Add all',
    emails: (isRemoving ? added : remaining).map(({email}) => email),
    isDisabled: !isRemoving && (remaining.length === 0 || doesNotFit)
  }
}

const getEmailSub = (check: InviteeCheck, orgName: string) => {
  switch (check.kind) {
    case 'closeToMember':
      return `No one at ${orgName} has this address`
    case 'newToParabol':
      return 'Not on Parabol yet'
    default:
      return `Outside ${orgName}`
  }
}

const toSection = (
  id: string,
  title: string,
  options: InviteeOption[],
  count: number | null = null
): InviteeOptionSection[] => (options.length === 0 ? [] : [{id, title, count, options}])

const getPartnerMeta = (directory: InviteeDirectory) => {
  const partnerById = new Map(directory.partners.map((partner) => [partner.userId, partner]))
  return (person: DirectoryPerson) => {
    const partner = partnerById.get(person.id)
    if (partner)
      return `${MeetingTypeToReadable[partner.meetingType]} · ${partnerDateFormat.format(new Date(partner.lastMetAt))}`
    const teamNames = directory.teams
      .filter(({memberIds}) => memberIds.includes(person.id))
      .map(({name}) => name)
    if (teamNames.length === 1) return `On ${teamNames[0]}`
    if (teamNames.length > 1) return `On ${teamNames.length} of your teams`
    return ''
  }
}

const buildSuggestions = (input: BuildInput): InviteeOptions => {
  const {directory, teamEmails, targetTeamId, showAllPartners} = input
  const getMeta = getPartnerMeta(directory)
  const partnerPeople = [...directory.partners]
    .sort((a, b) => b.lastMetAt.localeCompare(a.lastMetAt))
    .flatMap(({userId}) => directory.personById.get(userId) ?? [])
    .filter(({email}) => !teamEmails.has(email))
  const shown = showAllPartners ? partnerPeople : partnerPeople.slice(0, PARTNERS_SHOWN)
  const partnerOptions: InviteeOption[] = shown.map((person) =>
    makePersonOption(person, getMeta, input)
  )
  if (shown.length < partnerPeople.length) {
    partnerOptions.push({
      kind: 'showMore',
      id: 'show-more',
      count: partnerPeople.length - shown.length,
      firstHiddenId: `person-${partnerPeople[shown.length]!.id}`
    })
  }
  const teamOptions = directory.teams
    .filter(({id, memberIds}) => id !== targetTeamId && memberIds.length > 0)
    .map((team) => makeTeamOption(team, input))
  const sections = [
    ...toSection(
      'partners',
      'Met with you in the last 30 days',
      partnerOptions,
      partnerPeople.length
    ),
    ...toSection('teams', 'Your teams', teamOptions, teamOptions.length)
  ]
  return {
    sections,
    emptyText:
      sections.length === 0
        ? 'No suggestions yet. People you meet with in Parabol will show up here.'
        : null
  }
}

const buildEmailResult = (email: string, input: BuildInput): InviteeOptions => {
  const {directory} = input
  const check = checkInviteeEmail(email, directory)
  const peopleTitle = `People at ${directory.orgName}`
  if (check.kind === 'member') {
    const option = makePersonOption(check.person, () => '', input)
    return {sections: toSection('people', peopleTitle, [option]), emptyText: null}
  }
  const emailOption: InviteeOption = {
    kind: 'email',
    id: 'email',
    email: normalizeEmail(email),
    sub: getEmailSub(check, directory.orgName)
  }
  const closest =
    check.kind === 'closeToMember'
      ? [makePersonOption(check.person, () => 'Closest match', input)]
      : []
  return {
    sections: [
      ...toSection('did-you-mean', 'Did you mean', closest),
      ...toSection('email', 'Email', [emailOption])
    ],
    emptyText: null
  }
}

const toPeopleOptions = (ranked: DirectoryPerson[], input: BuildInput) => {
  const getMeta = getPartnerMeta(input.directory)
  const options = ranked.map((person) => makePersonOption(person, getMeta, input))
  return [
    ...options.filter(({disabledReason}) => !disabledReason),
    ...options.filter(({disabledReason}) => disabledReason)
  ].slice(0, SEARCH_PEOPLE_LIMIT)
}

const buildIncompleteEmail = (query: string, input: BuildInput): InviteeOptions => {
  const {directory} = input
  const people = toPeopleOptions(rankByEmailStart(query, directory), input)
  if (people.length === 0) {
    return {sections: [], emptyText: 'Finish the email address to invite someone new.'}
  }
  return {sections: toSection('people', `People at ${directory.orgName}`, people), emptyText: null}
}

const buildSearch = (query: string, input: BuildInput): InviteeOptions => {
  const {directory, targetTeamId} = input
  const people = toPeopleOptions(rankInviteePeople(query, directory), input)
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const teams = directory.teams
    .filter(
      ({id, name, memberIds}) =>
        id !== targetTeamId && memberIds.length > 0 && hasEveryPrefix(tokens, getWords(name))
    )
    .slice(0, SEARCH_TEAM_LIMIT)
    .map((team) => makeTeamOption(team, input))
  const sections = [
    ...toSection('people', `People at ${directory.orgName}`, people),
    ...toSection('teams', 'Your teams', teams)
  ]
  return {
    sections,
    emptyText:
      sections.length === 0
        ? `No one at ${directory.orgName} matches “${query}”. Type their email to invite them.`
        : null
  }
}

export const buildInviteeOptions = (input: BuildInput): InviteeOptions => {
  const query = input.query.trim()
  if (!query) return buildSuggestions(input)
  if (query.includes('@')) {
    return COMPLETE_EMAIL.test(query)
      ? buildEmailResult(query, input)
      : buildIncompleteEmail(query, input)
  }
  return buildSearch(query, input)
}

export const describeInviteeOption = (option: InviteeOption) => {
  switch (option.kind) {
    case 'person':
      return `${option.isAdded ? 'removes' : 'adds'} ${option.person.name}`
    case 'team': {
      const count = option.emails.length
      return `${option.action === 'add' ? 'adds' : 'removes'} ${count} ${plural(count, 'person', 'people')} from ${option.team.name}`
    }
    case 'email':
      return `invites ${option.email} by email`
    case 'showMore':
      return `shows ${option.count} more`
  }
}

export const isOptionEnabled = (option: InviteeOption) => {
  switch (option.kind) {
    case 'person':
      return option.disabledReason === null
    case 'team':
      return !option.isDisabled
    case 'email':
    case 'showMore':
      return true
  }
}
