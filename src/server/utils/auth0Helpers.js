import {AuthenticationClient, ManagementClient} from 'auth0';
import {auth0 as auth0ClientOptions} from '../../universal/utils/clientOptions';
import {getDotenv} from '../../universal/utils/dotenv';

// Import .env and expand variables:
getDotenv();

export const auth0AuthenticationClient = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN || 'parabol.auth0.com',
  // eslint-disable-next-line max-len
  token: process.env.AUTH0_MANAGEMENT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJrRGZOTURJUXRxQ21lbVFGVHVoTjh6WVN4TlNFN3JjaSIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbInVwZGF0ZSJdfSwidXNlcnNfYXBwX21ldGFkYXRhIjp7ImFjdGlvbnMiOlsicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSIsImNyZWF0ZSJdfX0sImlhdCI6MTQ3MTkxODAzNCwianRpIjoiMzdlOWFmYjRlMjEzOWYzMzNkMDkyNjY0NDBhMzk5MDEifQ.a6NANNe5IOzvFEomZm9OeeNpRfPjoMCUzA12PaK3zVg'
});

export const auth0ManagementClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN || 'parabol.auth0.com',
  // eslint-disable-next-line max-len
  token: process.env.AUTH0_MANAGEMENT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJrRGZOTURJUXRxQ21lbVFGVHVoTjh6WVN4TlNFN3JjaSIsInNjb3BlcyI6eyJ1c2VycyI6eyJhY3Rpb25zIjpbInVwZGF0ZSJdfSwidXNlcnNfYXBwX21ldGFkYXRhIjp7ImFjdGlvbnMiOlsicmVhZCIsInVwZGF0ZSIsImRlbGV0ZSIsImNyZWF0ZSJdfX0sImlhdCI6MTQ3MTkxODAzNCwianRpIjoiMzdlOWFmYjRlMjEzOWYzMzNkMDkyNjY0NDBhMzk5MDEifQ.a6NANNe5IOzvFEomZm9OeeNpRfPjoMCUzA12PaK3zVg'
});

export const clientId = auth0ClientOptions.clientId;

export const clientSecret = process.env.AUTH0_CLIENT_SECRET ||
  'BksPeQQrRkXhDrugzQDg5Nw-IInub9RkQ-pSWohUM9s6Oii4xoGVCrK2_OcUCfYZ';
