import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import JiraDimensionField from './JiraDimensionField'

export const AddMissingJiraFieldSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddMissingJiraFieldSuccess',
  fields: () => ({
    dimensionField: {
      description: 'Jira field which was just added to an issue screen',
      type: JiraDimensionField
    }
  })
})

const AddMissingJiraFieldPayload = makeMutationPayload(
  'AddMissingJiraFieldPayload',
  AddMissingJiraFieldSuccess
)

export default AddMissingJiraFieldPayload
