import {
  GraphQLUnionType
} from 'graphql';
import {Project} from '../Project/projectSchema';
import {Action} from '../Action/actionSchema';

export const Outcome = new GraphQLUnionType({
  name: 'Outcome',
  resolveType: (obj) => obj.status ? Project : Action,
  types: [Action, Project]
});
