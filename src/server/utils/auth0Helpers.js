import {ManagementClient} from 'auth0';
import {getDotenv} from '../../universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

if (!process.env.AUTH0_MANAGEMENT_TOKEN) {
  throw new Error('Please set AUTH0_MANAGEMENT_TOKEN environment variable');
}

export const auth0ManagementClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN || 'parabol.auth0.com',
  token: process.env.AUTH0_MANAGEMENT_TOKEN
});

export const clientSecret = process.env.AUTH0_CLIENT_SECRET ||
  'BksPeQQrRkXhDrugzQDg5Nw-IInub9RkQ-pSWohUM9s6Oii4xoGVCrK2_OcUCfYZ';
