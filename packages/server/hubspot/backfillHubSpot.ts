// call with yarn sucrase-node hubspot/backfillHubSpot.ts
import fetch from 'node-fetch'
import '../../../scripts/webpack/utils/dotenv'
import {getUsersByEmails} from '../postgres/queries/getUsersByEmails'

const contactKeys = {
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

const normalize = (value?: string | number) => {
  if (typeof value === 'string' && new Date(value).toJSON() === value) {
    return new Date(value).getTime()
  }
  return value
}

const hapiKey = process.env.HUBSPOT_API_KEY

const upsertHubspotContact = async (
  email: string,
  propertiesObj: {[key: string]: string | number}
) => {
  if (!propertiesObj || Object.keys(propertiesObj).length === 0) return
  const body = JSON.stringify({
    properties: Object.keys(propertiesObj).map((key) => ({
      property: contactKeys[key as keyof typeof contactKeys],
      value: normalize(propertiesObj[key])
    }))
  })
  const res = await fetch(
    `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${email}/?hapikey=${hapiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    }
  )
  if (!String(res.status).startsWith('2')) {
    const responseBody = await res.json()
    console.error(`Failed to update HubSpot for ${email}: `, responseBody.message)
  }
}

const backfillHubSpot = async () => {
  const emails = process.argv.slice(2)
  const users = await getUsersByEmails(emails)

  await Promise.all(
    users.map(async ({email, id, tier}) => {
      const contact = {id, tier}
      upsertHubspotContact(email, contact)
    })
  )
}

backfillHubSpot()
