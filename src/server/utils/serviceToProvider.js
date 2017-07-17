import {GITHUB, SLACK} from 'universal/utils/constants';

// tableName == GraphQLType
export default {
  [SLACK]: 'SlackIntegration',
  [GITHUB]: 'GitHubIntegration'
};
