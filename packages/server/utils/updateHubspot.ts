import fetch from 'node-fetch'
import sleep from 'parabol-client/utils/sleep'
import ServerAuthToken from '../database/types/ServerAuthToken'
import IUser from '../postgres/types/IUser'
import sendToSentry from './sendToSentry'

interface Company {
  userCount: number
  activeUserCount: number
  [key: string]: number
}
interface UserPayloadBase {
  email: string
  isRemoved: boolean
  [key: string]: string | number | boolean
}
type UserPayload = UserPayloadBase & {company: Company}

interface ParabolPayload {
  user: UserPayload
  [key: string]: UserPayload
}

interface BulkRecord {
  id?: string
  email: string
  [key: string]: string | number | undefined
}

const contactKeys: Record<string, string> = {
  lastMetAt: 'last_met_at',
  isAnyBillingLeader: 'is_any_billing_leader',
  monthlyStreakCurrent: 'monthly_streak_current',
  monthlyStreakMax: 'monthly_streak_max',
  createdAt: 'joined_at',
  isPatientZero: 'is_patient_zero',
  isRemoved: 'is_user_removed',
  id: 'parabol_id',
  meetingCount: 'sales_op_meeting_count',
  payLaterClickCount: 'pay_later_click_count',
  preferredName: 'parabol_preferred_name',
  tier: 'highest_tier'
} as const

const companyKeys: Record<string, string> = {
  lastMetAt: 'last_met_at',
  userCount: 'user_count',
  activeUserCount: 'active_user_count',
  activeTeamCount: 'active_team_count',
  meetingCount: 'meeting_count',
  monthlyTeamStreakMax: 'monthly_team_streak_max',
  tier: 'highest_tier'
} as const

const queries: Record<string, string> = {
  'Changed name': `
query ChangedName($userId: ID!) {
  user(userId: $userId) {
    email
    preferredName
  }
}`,
  'Meeting Completed': `
query MeetingCompleted($userIds: [ID!]!, $userId: ID!) {
  company(userId: $userId) {
    tier
    lastMetAt
    meetingCount
    activeUserCount
    activeTeamCount
    monthlyTeamStreakMax
  }
  users(userIds: $userIds) {
    id
    email
    lastMetAt
    meetingCount
    monthlyStreakCurrent
    monthlyStreakMax
  }
}`,
  'Conversion Modal Pay Later Clicked': `
query PayLaterClicked($userId: ID!) {
  user(userId: $userId) {
    email
    payLaterClickCount
  }
}`,
  'New Org': `
query NewOrg($userId: ID!) {
  user(userId: $userId) {
    email
    isAnyBillingLeader
    company {
      tier
      activeTeamCount
    }
  }
}`,
  'User Role Billing Leader Granted': `
query BillingLeaderGranted($userId: ID!) {
  user(userId: $userId) {
    email
    isAnyBillingLeader
  }
}`,
  'User Role Billing Leader Revoked': `
query BillingLeaderRevoked($userId: ID!) {
  user(userId: $userId) {
    email
    isAnyBillingLeader
  }
}`,
  'Account Created': `
query AccountCreated($userId: ID!) {
  user(userId: $userId) {
    id
    preferredName
    email
    createdAt
    isPatientZero
    company {
      userCount
      activeUserCount
      activeTeamCount
    }
  }
}`,
  'Account Removed': `
query AccountRemoved($userId: ID!) {
  user(userId: $userId) {
    email
    isRemoved
    company {
      userCount
      activeUserCount
      activeTeamCount
    }
  }
}`,
  'Account Paused': `
query AccountPaused($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      activeUserCount
      activeTeamCount
    }
  }
}`,
  'Account Unpaused': `
query AccountUnpaused($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      activeUserCount
      activeTeamCount
    }
  }
}`,
  'New Team': `
query NewTeam($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      tier
      activeTeamCount
    }
  }
}`,
  'Archive Team': `
query ArchiveTeam($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      tier
      activeTeamCount
    }
  }
}`,
  'Organization Upgraded': `
  query UpgradeToPro($userId: ID!) {
    company(userId: $userId) {
      tier
      organizations {
        organizationUsers {
          edges {
            node {
              user {
                email
                tier
              }
            }
          }
        }
      }
    }
  }`,
  'Organization Downgraded': `
  query UpgradeToPro($userId: ID!) {
    company(userId: $userId) {
      tier
      organizations {
        organizationUsers {
          edges {
            node {
              user {
                email
                tier
              }
            }
          }
        }
      }
    }
  }`
} as const

const tierChanges = ['Organization Upgraded', 'Organization Downgraded']
const hapiKey = process.env.HUBSPOT_API_KEY

const parabolFetch = async (query: string, variables: Record<string, unknown>) => {
  const executeGraphQL = require('../graphql/executeGraphQL').default
  const result = await executeGraphQL({
    authToken: new ServerAuthToken(),
    query,
    variables,
    isPrivate: true
  })

  if (result.errors?.[0]) {
    const [firstError] = result.errors
    const safeError = new Error(firstError.message)
    safeError.stack = (firstError as Error).stack
    sendToSentry(safeError)
  }
  if (!result.data) {
    sendToSentry(new Error('HS Parabol did not return data'), {
      tags: {query, variables: JSON.stringify(variables)}
    })
  }
  return result.data
}

const normalize = (value?: string | number | boolean) => {
  if (typeof value === 'string' && new Date(value).toJSON() === value) {
    return new Date(value).getTime()
  }
  return value
}

const upsertHubspotContact = async (
  email: string,
  propertiesObj: {[key: string]: string | number | boolean},
  retryCount = 0
) => {
  if (!propertiesObj || Object.keys(propertiesObj).length === 0) return
  const body = JSON.stringify({
    properties: Object.keys(propertiesObj).map((key) => ({
      property: contactKeys[key],
      value: normalize(propertiesObj[key])
    }))
  })
  const res = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${email}/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hapiKey}`,
        'Content-Type': 'application/json'
      },
      body
    }
  )
  if (!String(res.status).startsWith('2')) {
    sendToSentry(new Error('HS upsertContact Fail'), {tags: {email, body}})
    if (retryCount < 3) upsertHubspotContact(email, propertiesObj, retryCount + 1)
  }
}

const updateHubspotBulkContact = async (records: BulkRecord[], retryCount = 0) => {
  if (!records || Object.keys(records).length === 0) return
  const body = JSON.stringify(
    records.map((record) => {
      const {email, ...props} = record
      return {
        email,
        properties: Object.keys(props).map((key) => ({
          property: contactKeys[key],
          value: normalize(props[key])
        }))
      }
    })
  )
  const res = await fetch(`https://api.hubapi.com/contacts/v1/contact/batch/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hapiKey}`,
      'Content-Type': 'application/json'
    },
    body
  })
  if (!String(res.status).startsWith('2')) {
    sendToSentry(new Error('HS Fail bulk contact update'), {tags: {body}})
    if (retryCount < 3) {
      updateHubspotBulkContact(records, retryCount + 1)
    }
  }
}

const updateHubspotCompany = async (
  email: string,
  propertiesObj: {[key: string]: string | number},
  retryCount = 0
) => {
  if (!propertiesObj || Object.keys(propertiesObj).length === 0) return
  const url = `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?property=associatedcompanyid&property_mode=value_only&formSubmissionMode=none&showListMemberships=false`
  const contactRes = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${hapiKey}`,
      'Content-Type': 'application/json'
    }
  })
  const contactStatus = String(contactRes.status)
  if (!contactStatus.startsWith('2')) {
    await sleep(2000)
    if (contactStatus !== '404') {
      // 404 happens when the contact isn't created yet. don't send that error to sentry
      sendToSentry(new Error('HS Update Company Fail. No Contact'), {tags: {email}})
    }
    if (retryCount >= 3) return
    updateHubspotCompany(email, propertiesObj, retryCount + 1)
    return
  }
  const contactResJSON = await contactRes.json()
  const associatedCompany = contactResJSON['associated-company']
  const companyId = associatedCompany ? associatedCompany['company-id'] : undefined
  if (!companyId) {
    sendToSentry(new Error('HS No CompanyID'), {
      tags: {email, associatedCompany: JSON.stringify(associatedCompany)}
    })
    if (retryCount >= 3) return
    updateHubspotCompany(email, propertiesObj, retryCount + 1)
    return
  }
  const body = JSON.stringify({
    properties: Object.keys(propertiesObj).map((key) => ({
      name: companyKeys[key],
      value: normalize(propertiesObj[key])
    }))
  })
  const companyRes = await fetch(`https://api.hubapi.com/companies/v2/companies/${companyId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${hapiKey}`,
      'Content-Type': 'application/json'
    },
    body
  })
  if (!String(companyRes.status).startsWith('2')) {
    let errBody
    try {
      errBody = await companyRes.json()
    } catch {
      errBody = ''
    }

    sendToSentry(new Error('HS Bad Compamny Update'), {
      tags: {email, body, companyId, error: JSON.stringify(errBody)}
    })
    if (retryCount >= 3) return
    updateHubspotCompany(email, propertiesObj, retryCount + 1)
    return
  }
}

const updateHubspotParallel = async (query: string | undefined, userId: string) => {
  if (!query) return
  const parabolPayload = await parabolFetch(query, {userId})
  if (!parabolPayload) return
  const {user} = parabolPayload
  const {email, company, ...contact} = user
  await Promise.all([upsertHubspotContact(email, contact), updateHubspotCompany(email, company)])
}

const updateHubspot = async (event: string, user: IUser, properties: BulkRecord) => {
  if (!hapiKey) return
  const query = queries[event]
  if (!query) return
  const {id: userId} = user
  if (event === 'Meeting Completed') {
    const {userIds} = properties
    // only the facilitator has userIds
    if (!userIds) return
    const parabolPayload = await parabolFetch(query, {userIds, userId})
    if (!parabolPayload) return
    const {users, company} = parabolPayload
    const facilitator = users.find((user: any) => user.id === userId)
    const {email} = facilitator
    await Promise.all([updateHubspotBulkContact(users), updateHubspotCompany(email, company)])
  } else if (event === 'Account Created') {
    const parabolPayload = await parabolFetch(query, {userId})
    if (!parabolPayload) return
    const {user} = parabolPayload
    const {email, company, ...contact} = user
    await upsertHubspotContact(email, contact)
    // wait for hubspot to associate the contact with the company, fn must run in 5 seconds
    await sleep(5000)
    await updateHubspotCompany(email, company)
  } else if (event === 'Account Removed') {
    const {parabolPayload} = properties
    if (!parabolPayload) return
    const {user} = parabolPayload as unknown as ParabolPayload
    const {email, company, ...contact} = user
    await Promise.all([upsertHubspotContact(email, contact), updateHubspotCompany(email, company)])
  } else if (tierChanges.includes(event)) {
    const {email} = properties
    const parabolPayload = await parabolFetch(query, {userId})
    if (!parabolPayload) return
    const {company} = parabolPayload
    const {tier, organizations} = company
    const users = [] as {email: string; [key: string]: string | number}[]
    const emails = new Set<string>()
    organizations.forEach((organization: any) => {
      const {organizationUsers} = organization
      const {edges} = organizationUsers
      edges.forEach((edge: any) => {
        const {node} = edge
        const {user} = node
        const {email} = user
        if (emails.has(email)) return
        emails.add(email)
        users.push(user)
      })
    })
    await Promise.all([updateHubspotBulkContact(users), updateHubspotCompany(email, {tier})])
  } else {
    // standard handler
    await updateHubspotParallel(query, userId)
  }
}

export default updateHubspot
