import {GraphQLInterfaceType} from 'graphql';
import IntegrationService from 'server/graphql/types/IntegrationService';
import GitHubProject from 'server/graphql/types/GitHubProject';
import {GITHUB} from 'universal/utils/constants';

const resolveTypeLookup = {
  [GITHUB]: GitHubProject
};

const ProjectIntegration = new GraphQLInterfaceType({
  name: 'ProjectIntegration',
  fields: {
    service: {
      type: IntegrationService
    }
  },
  resolveType(value) {
    return resolveTypeLookup[value.service];
  }
});

export default ProjectIntegration;
