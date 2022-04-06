import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const JiraServerIssueFieldMetadata = new GraphQLObjectType<any, GQLContext>({
  name: 'JiraServerIssueFieldMetadata',
  description: 'The Jira Issue that comes direct from Jira Server',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    typeId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    allowedValues: {
      type: new GraphQLList(GraphQLString)
    }
  })
})

export default JiraServerIssueFieldMetadata 

