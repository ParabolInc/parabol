import {GraphQLInterfaceType} from 'graphql';
import IntegrationService from 'server/graphql/types/IntegrationService';
import GitHubTask from 'server/graphql/types/GitHubTask';
import {GITHUB} from 'universal/utils/constants';

const resolveTypeLookup = {
  [GITHUB]: GitHubTask
};

const TaskIntegration = new GraphQLInterfaceType({
  name: 'TaskIntegration',
  fields: {
    service: {
      type: IntegrationService
    }
  },
  resolveType(value) {
    return resolveTypeLookup[value.service];
  }
});

export default TaskIntegration;
