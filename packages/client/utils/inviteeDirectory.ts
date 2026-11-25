import type {MeetingTypeEnum} from '../__generated__/SummarySheet_meeting.graphql'
import {formatApprovedList, isEmailOnApprovedList} from '../shared/approvedDomains'
import {normalizeEmail} from '../shared/emailAddress'

export type DirectoryPerson = {id: string; name: string; email: string; picture: string}
export type DirectoryTeam = {id: string; name: string; memberIds: string[]}
export type DirectoryPartner = {userId: string; lastMetAt: string; meetingType: MeetingTypeEnum}
export type InviteeDirectory = {
  orgName: string
  people: DirectoryPerson[]
  personByEmail: Map<string, DirectoryPerson>
  personById: Map<string, DirectoryPerson>
  domains: Set<string>
  approvedDomains: string[]
  partners: DirectoryPartner[]
  teams: DirectoryTeam[]
}
export type InviteeCheck =
  | {kind: 'member'; person: DirectoryPerson}
  | {kind: 'closeToMember'; person: DirectoryPerson; message: string}
  | {kind: 'notApproved' | 'newToParabol' | 'outsideOrg'; message: string}

export const NEW_TO_PARABOL_MESSAGE = "isn't on Parabol yet and will get an email invite."

const getDomain = (email: string) => email.slice(email.lastIndexOf('@') + 1)
const getLocalPart = (email: string) => email.slice(0, email.lastIndexOf('@'))

const getApprovedBaseDomain = (approvedDomain: string) => {
  if (approvedDomain.startsWith('*.')) return approvedDomain.slice(2)
  if (approvedDomain.includes('@')) return getDomain(approvedDomain)
  return approvedDomain
}

export const makeInviteeDirectory = ({
  orgName,
  viewerId,
  approvedDomains,
  members,
  partners,
  teams
}: {
  orgName: string
  viewerId: string
  approvedDomains: readonly string[]
  members: readonly {id: string; preferredName: string; email: string; picture: string}[]
  partners: readonly DirectoryPartner[]
  teams: readonly {id: string; name: string; memberIds: readonly string[]}[]
}): InviteeDirectory => {
  const people = members
    .filter(({id}) => id !== viewerId)
    .map(({id, preferredName, email, picture}) => ({
      id,
      name: preferredName,
      email: normalizeEmail(email),
      picture
    }))
  const personByEmail = new Map(people.map((person) => [person.email, person]))
  const personById = new Map(people.map((person) => [person.id, person]))
  const domains = new Set([
    ...members.map(({email}) => getDomain(normalizeEmail(email))),
    ...approvedDomains.map((approvedDomain) => getApprovedBaseDomain(approvedDomain.toLowerCase()))
  ])
  return {
    orgName,
    people,
    personByEmail,
    personById,
    domains,
    approvedDomains: [...approvedDomains],
    partners: partners.filter(({userId}) => personById.has(userId)),
    teams: teams.map(({id, name, memberIds}) => ({
      id,
      name,
      memberIds: memberIds.filter((memberId) => memberId !== viewerId)
    }))
  }
}

export const editDistance = (a: string, b: string) => {
  let previousRow = Array.from({length: b.length + 1}, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(
        previousRow[j]! + 1,
        row[j - 1]! + 1,
        previousRow[j - 1]! + substitutionCost
      )
    }
    previousRow = row
  }
  return previousRow[b.length]!
}

export const isCloseLocalPart = (typed: string, member: string) => {
  if (typed === member) return false
  const maxDistance = Math.min(typed.length, member.length) < 6 ? 1 : 2
  return editDistance(typed, member) <= maxDistance
}

export const checkInviteeEmail = (email: string, directory: InviteeDirectory): InviteeCheck => {
  const {orgName, people, personByEmail, domains, approvedDomains} = directory
  const typedEmail = normalizeEmail(email)
  const member = personByEmail.get(typedEmail)
  if (member) return {kind: 'member', person: member}
  if (approvedDomains.length > 0 && !isEmailOnApprovedList(typedEmail, approvedDomains)) {
    return {
      kind: 'notApproved',
      message: `${orgName} only accepts ${formatApprovedList(approvedDomains)} addresses. Ask your account admin or support@parabol.co to approve more.`
    }
  }
  const typedDomain = getDomain(typedEmail)
  const typedLocalPart = getLocalPart(typedEmail)
  let closest: DirectoryPerson | undefined
  let closestDistance = Number.POSITIVE_INFINITY
  for (const person of people) {
    if (getDomain(person.email) !== typedDomain) continue
    const memberLocalPart = getLocalPart(person.email)
    if (!isCloseLocalPart(typedLocalPart, memberLocalPart)) continue
    const distance = editDistance(typedLocalPart, memberLocalPart)
    if (distance < closestDistance) {
      closest = person
      closestDistance = distance
    }
  }
  if (closest)
    return {kind: 'closeToMember', person: closest, message: `isn't anyone at ${orgName}.`}
  if (approvedDomains.length > 0 || domains.has(typedDomain)) {
    return {kind: 'newToParabol', message: NEW_TO_PARABOL_MESSAGE}
  }
  return {kind: 'outsideOrg', message: `is outside ${orgName} and will get an email invite.`}
}
