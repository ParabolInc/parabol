import intranetJobsQuery from './models/IntranetJobs/intranetJobsQuery';
import {GraphQLObjectType, GraphQLSchema} from 'graphql';

const queryFields = Object.assign({},
  intranetJobsQuery
);

const query = new GraphQLObjectType({
  name: 'IntranetQuery',
  fields: () => queryFields
});

export default new GraphQLSchema({query});
