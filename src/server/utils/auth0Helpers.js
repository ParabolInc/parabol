import {ManagementClient} from 'auth0';
import fetch from 'node-fetch';
import getDotenv from '../../universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

let client = null;

export const auth0MgmtClientBuilder = async () => {
  if (process.env.NODE_ENV === 'test' && client == null) {
    client = new ManagementClient();
  } else if (client == null) {
    const url = `https://${process.env.AUTH0_MANAGEMENT_HOST}/oauth/token` || 'https://parabol.auth0.com/oauth/token';
    const options = {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID || 'CFSD0cQHAtxg5F0QvffT611jq047I9tW',
        client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || 'sGIFhBb-WtvU-aSE5EnGGSmOOs6xiOZm_DmPRH4DHYfE5yu1ABB3oxkxKEbkhYjk',
        audience: `https://${process.env.AUTH0_MANAGEMENT_HOST}/api/v2/` || 'https://parabol.auth0.com/api/v2',
        grant_type: 'client_credentials'
      })
    };
    const res = await fetch(url, options);
    const payload = await res.json();
    client = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN || 'parabol.auth0.com',
      token: payload.access_token
    });
  }

  return client;
};

export const clientId = process.env.AUTH0_CLIENT_ID;

export const clientSecret = process.env.AUTH0_CLIENT_SECRET ||
  'BksPeQQrRkXhDrugzQDg5Nw-IInub9RkQ-pSWohUM9s6Oii4xoGVCrK2_OcUCfYZ';
