import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const GitLabSelectedProject = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabSelectedProject',
  description: 'A GitLab project that has been selected as a filter',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    fullPath: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The unique full path from GitLab, e.g. parabol1/parabol'
    }
  })
})

export default GitLabSelectedProject
