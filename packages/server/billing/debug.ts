// call with pnpm sucrase-node billing/debug.ts
import '../../../scripts/webpack/utils/dotenv'

const doDebugStuff = async () => {
  // const manager = getStripeManager()
  // const res = await manager.updateSubscriptionQuantity('foo', 39, 1597966749)
  // Logger.log('res', {res})
  const query = `query {
  viewer {
      id
      preferredName
      lastSeenAt
      pages(first: 10) {
        edges {
          node {
            title
          }
        }
      }
  }
}`
  const accessToken = 'pat_eA31BU_CbCIlNPUAVNJSK4hOjL5m7s_MLtraixy7EHY'
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
