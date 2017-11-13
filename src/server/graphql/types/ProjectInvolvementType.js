import {GraphQLEnumType} from 'graphql';
import {ASSIGNEE, MENTIONEE} from 'universal/utils/constants';

const ProjectInvolvementType = new GraphQLEnumType({
  name: 'ProjectInvolvementType',
  description: 'How a user is involved with a project (listed in hierarchical order)',
  values: {
    [ASSIGNEE]: {},
    [MENTIONEE]: {}
  }
});

export default ProjectInvolvementType;
