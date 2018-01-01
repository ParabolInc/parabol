import {GraphQLUnionType} from 'graphql';
import ProjectAdded from 'server/graphql/types/ProjectAdded';
import ProjectEdited from 'server/graphql/types/ProjectEdited';
import ProjectRemoved from 'server/graphql/types/ProjectRemoved';
import ProjectUpdated from 'server/graphql/types/ProjectUpdated';
import {ADDED, EDITED, REMOVED, UPDATED} from 'universal/utils/constants';

const resolveTypeLookup = {
  [ADDED]: ProjectAdded,
  [UPDATED]: ProjectUpdated,
  [REMOVED]: ProjectRemoved,
  [EDITED]: ProjectEdited
};

const ProjectSubscriptionPayload = new GraphQLUnionType({
  name: 'ProjectSubscriptionPayload',
  types: () => Object.values(resolveTypeLookup),
  resolveType: ({type}) => resolveTypeLookup[type]
});

export default ProjectSubscriptionPayload;
