const crypto = require('crypto')
const fetch = require('node-fetch')

interface Payload {
  parabolToken: string
  event: string
  timestamp: number
  userId: string
}

interface Settings {
  hubspotKey: string
  segmentFnKey: string
}
const contactKeys = {
  lastMetAt: 'last_met_at',
  isAnyBillingLeader: 'is_any_billing_leader',
  monthlyStreakCurrent: 'monthly_streak_current',
  joinedAt: 'joined_at',
  isPatientZero: 'is_patient_zero',
  isRemoved: 'is_user_removed'
}

const companyKeys = {
  userCount: 'user_count',
  activeUserCount: 'active_user_count',
  activeTeamCount: 'active_team_count',
  meetingCount: 'meeting_count',
  monthlyTeamStreakMax: 'monthly_team_streak_max',
}

const queries = {
  'Meeting Completed': `
query MeetingCompleted($userId: ID!) {
  user(userId: $userId) {
    email
    lastMetAt
    monthlyStreakCurrent
    monthlyStreakMax
    company {
      meetingCount
      monthlyTeamStreakMax
    }
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
      teamCount
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
    email
    joinedAt
    isPatientZero
    company {
      userCount
      activeUserCount
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
    }
  }
}`,
  'Account Paused': `
query AccountPaused($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      activeUserCount
    }
  }
}`,
  'Account Unpaused': `
query AccountUnpaused($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      activeUserCount
    }
  }
}`,
  'New Team': `
query NewTeam($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      activeTeamCount
    }
  }
}`,
  'Archive Team': `
query ArchiveTeam($userId: ID!) {
  user(userId: $userId) {
    email
    company {
      activeTeamCount
    }
  }
}`
}

const parabolFetch = async (query: string, userId: string, token: string) => {
  const res = await fetch(`http://localhost:3000/webhooks/graphql`, {
    // const res = await fetch(`https://action.parabol.co/webhooks/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {userId}
    })
  })
  const resJSON = await res.json()
  const {data} = resJSON
  return data
}

const normalize = (value: string) => {
  if (typeof value === 'string' && new Date(value).toJSON() === value) {
    return new Date(value).getTime()
  }
  return value
}

const updateHubspotContact = async (email: string, hapiKey: string, propertiesObj: {[key: string]: string | number}) => {
  if (!propertiesObj || Object.keys(propertiesObj).length === 0) return
  await fetch(
    `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${hapiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: Object.keys(propertiesObj).map((key) => ({
          property: normalize(contactKeys[key]),
          value: propertiesObj[key]
        }))
      })
    }
  )
}

const updateHubspotCompany = async (email: string, hapiKey: string, propertiesObj: {[key: string]: string | number}) => {
  if (!propertiesObj || Object.keys(propertiesObj).length === 0) return
  const contactRes = await fetch(`https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${hapiKey}&property=associatedcompanyid&property_mode=value_only&formSubmissionMode=none&showListMemberships=false`)
  const contactResJSON = await contactRes.json()
  const companyId = contactResJSON['associated-company']['company-id']
  await fetch(`https://api.hubapi.com/companies/v2/companies/${companyId}?hapikey=${hapiKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: Object.keys(propertiesObj).map((key) => ({
        name: companyKeys[key],
        value: propertiesObj[key]
      }))
    })
  })
}

const updateHubspot = async (query: string | undefined, userId: string, queryToken: string, hubspotKey: string) => {
  if (!query) return
  const parabolPayload = await parabolFetch(query, userId, queryToken)
  if (!parabolPayload) return
  const {user} = parabolPayload
  const {email, company, ...contact} = user
  await Promise.all([
    updateHubspotContact(email, hubspotKey, contact),
    updateHubspotCompany(email, hubspotKey, company)
  ])
}

async function onTrack(payload: Payload, settings: Settings) {
  const {parabolToken, event, timestamp, userId} = payload
  const {hubspotKey, segmentFnKey} = settings
  const signature = crypto.createHmac('sha256', segmentFnKey).update(parabolToken).digest('base64')
  const queryToken = `${timestamp}.${signature}`
  const query = queries[event]
  await updateHubspot(query, userId, queryToken, hubspotKey))
}
