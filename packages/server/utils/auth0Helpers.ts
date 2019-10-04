import getDotenv from '../../server/utils/dotenv'
import isAuth0User from './isAuth0User'
import getAuth0ManagementClient from './getAuth0ManagementClient'

// Import .env and expand variables:
getDotenv()

export const clientId = process.env.AUTH0_CLIENT_ID
export const clientSecret = process.env.AUTH0_CLIENT_SECRET!
export const domain = process.env.AUTH0_DOMAIN

export const updateAuth0TMS = (userId: string, tms: string[]) => {
  if (isAuth0User(userId)) {
    getAuth0ManagementClient().users.updateAppMetadata({id: userId}, {tms})
  }
}
