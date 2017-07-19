import {GITHUB, SLACK} from 'universal/utils/constants';

export const integrationNames = [
  {
    service: GITHUB,
    table: 'GitHubIntegration'
  },
  {
    service: SLACK,
    table: 'SlackIntegration'
  }
];

// tableName == GraphQLType
const serviceToProvider = integrationNames.reduce((obj, integration) => {
  obj[integration.service] = integration.table;
  return obj;
}, {});

export default serviceToProvider;