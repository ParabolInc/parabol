// call with pnpm sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'

const doDebugStuff = async () => {
  // const manager = getStripeManager()
  // const res = await manager.updateSubscriptionQuantity('foo', 39, 1597966749)
  // Logger.log('res', {res})
  const query = `mutation {
  editPageContent(pageId: "page:59149364", content: "foo", format: json) {
    page {
      id
    }
  }
}`
  const accessToken = 'pat_J6iIHMSjtWhtmh4J-NIGfdU7gP6rEO0LwVE2odFjJq4'
  const res = await fetch('https://localhost:3000/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: JSON.stringify({query})
  })
  const resJSON = await res.json()
  console.log(JSON.stringify(resJSON), res.headers)
}

doDebugStuff()
