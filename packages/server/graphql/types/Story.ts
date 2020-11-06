import {GraphQLID, GraphQLNonNull, GraphQLList, GraphQLInterfaceType} from 'graphql'
import ThreadSource, {threadSourceFields} from './ThreadSource'
import CommentorDetails from './CommentorDetails'
import JiraIssue from './JiraIssue'
import Task from './Task'
import {StoryTypeEnum} from './StoryTypeEnum'

export const storyFields = () => ({
  ...threadSourceFields(),
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The unique story id teamId::shortid'
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
  resolveType: (story) => {
    return story.type === StoryTypeEnum.JIRA_ISSUE ? JiraIssue : Task
  }
})

export default Story
