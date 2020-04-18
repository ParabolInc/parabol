
const nodeFetch = require('node-fetch')

async function updatePayLaterClickedCount({ count, email, apiKey }) {
  // Grab the pay later clicked count from properties
  const result = await nodeFetch(`https://api.hubapi.com/contacts/v1/contact/email/${email}/profile?hapikey=${apiKey}`,
    {
      method: 'POST', body: JSON.stringify({
        'parabol_app_v5_pay_later_clicks': count
      })
    }).then((res) => {
      return res.json()
    }).catch((err) => {
      console.error(err)
    })

  return result
}

async function onTrack(payload, settings) {
  const properties = payload.properties
  const traits = properties.traits
  if (payload.event === 'Conversion Modal Pay Later Clicked') {
    return await updatePayLaterClickedCount({
      count: properties.payLaterClickCount,
      email: traits.email,
      apiKey: settings.apiKey
    })
  }
}
if (require.main === module) {
  const API_KEY = process.env.HUBSPOT_API_KEY

  async function main() {
    const testPayload = {
      'event': 'Conversion Modal Pay Later Clicked',
      'properties': {
        payLaterClickCount: 3,
        traits: {
          email: process.env.HUBSPOT_CONTACT_EMAIL
        }
      }
    }
    await onTrack(testPayload, { apiKey: API_KEY })
  }
  main().catch((err) => {
    console.error(err)
  })
}