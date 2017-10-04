import {GraphQLEnumType} from 'graphql';
import {ACTIVE, DONE, FUTURE, STUCK} from 'universal/utils/constants';

const ProjectStatusEnum = new GraphQLEnumType({
  name: 'ProjectStatusEnum',
  description: 'The status of the project',
  values: {
    [ACTIVE]: {},
    [STUCK]: {},
    [DONE]: {},
    [FUTURE]: {}
  }
});

export default ProjectStatusEnum;
