import {ManagementClient} from 'auth0'
import getDotenv from '../../universal/utils/dotenv'

// Import .env and expand variables:
getDotenv()

export const clientId = process.env.AUTH0_CLIENT_ID
export const clientSecret = process.env.AUTH0_CLIENT_SECRET
export const domain = process.env.AUTH0_DOMAIN
export const managementClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID
export const managementClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET
export const managementDomain = process.env.AUTH0_MANAGEMENT_DOMAIN

export const auth0ManagementClient = new ManagementClient({
  clientId: managementClientId,
  clientSecret: managementClientSecret,
  domain: managementDomain
})
