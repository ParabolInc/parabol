const crypto = require('crypto')
const fetch = require('node-fetch')












const contactKeys = {
  lastMetAt: 'last_met_at',
  isAnyBillingLeader: 'is_any_billing_leader',
  monthlyStreakCurrent: 'monthly_streak_current',
  joinedAt: 'joined_at',
  isPatientZero: 'is_patient_zero',
}

const companyKeys = {
  userCount: 'user_count',
  activeUserCount: 'active_user_count',
  activeTeamCount: 'active_team_count',
  meetingCount: 'meeting_count',
  monthlyTeamStreakMax: 'monthly_team_streak_max',
}

const meetingCompletedQuery = `
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
}`

const parabolFetch = async (token, query, userId) => {
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

const updateHubspotContact = async (email, hapiKey, propertiesObj) => {
  const res = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${hapiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: Object.keys(propertiesObj).map((key) => ({
          property: contactKeys[key],
          value: propertiesObj[key]
        }))
      })
    }
  )
}

const updateHubspotCompany = async (email, hapiKey, propertiesObj) => {
  if (!propertiesObj) return
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

async function onTrack(payload, settings) {
  const {parabolToken, event, timestamp, userId} = payload
  const {hubspotKey, segmentFnKey} = settings
  const signature = crypto.createHmac('sha256', segmentFnKey).update(parabolToken).digest('base64')
  const queryToken = `${timestamp}.${signature}`
  const handlers = {
    'Meeting Completed': async () => {
      const data = await parabolFetch(queryToken, meetingCompletedQuery, userId)
      if (!data) return
      const {user} = data
      const {email, lastMetAt, monthlyStreakCurrent, monthlyStreakMax, company} = user
      await Promise.all([
        updateHubspotContact(email, hubspotKey, {lastMetAt: new Date(lastMetAt).getTime(), monthlyStreakCurrent, monthlyStreakMax}),
        updateHubspotCompany(email, hubspotKey, company)
      ])
    }
  }

  const handler = handlers[event]
  if (!handler) return
  await handler()
}
