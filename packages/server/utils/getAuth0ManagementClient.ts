import {ManagementClient} from 'auth0'

let auth0ManagementClient
const getAuth0ManagementClient = () => {
  if (!auth0ManagementClient) {
    auth0ManagementClient = new ManagementClient({
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      domain: process.env.AUTH0_MANAGEMENT_DOMAIN
    })
  }
  return auth0ManagementClient
}

export default getAuth0ManagementClient
