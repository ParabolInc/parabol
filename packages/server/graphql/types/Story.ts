import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInterfaceType
} from 'graphql'
import {GQLContext} from '../graphql'
import ThreadSource, {threadSourceFields} from './ThreadSource'
import {ThreadSourceEnum} from 'parabol-client/types/graphql'
import CommentorDetails from './CommentorDetails'
import JiraIssue from './JiraIssue'
import Task from './Task'
import getThreadSourceType from './getThreadSourceType'

// const Story = new GraphQLObjectType<any, GQLContext>({
//   name: 'Story',
//   description: 'A single story created in Sprint Poker',
//   interfaces: () => [ThreadSource],
//   fields: () => ({
//     ...threadSourceFields(),
//     id: {
//       type: new GraphQLNonNull(GraphQLID),
//       description: 'The unique story id teamId::shortid'
//     },
//     commentors: {
//       type: new GraphQLList(new GraphQLNonNull(CommentorDetails)),
//       description: 'A list of users currently commenting',
//       resolve: ({commentors = []}) => {
//         return commentors
//       }
//     }
//   })
// })

export const storyFields = () => ({
  ...threadSourceFields(),
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The unique story id teamId::shortid'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  commentors: {
    type: new GraphQLList(new GraphQLNonNull(CommentorDetails)),
    description: 'A list of users currently commenting',
    resolve: ({commentors = []}) => {
      return commentors
    }
  }
})

const Story = new GraphQLInterfaceType({
  name: 'Story',
  description: 'A single story created in Sprint Poker',
  interfaces: () => [ThreadSource],
  fields: () => ({
    ...storyFields()
  }),
  resolveType: (type) => {
    console.log('type', type)
    return type.cloudId ? JiraIssue : Task
  }
})

export default Story
