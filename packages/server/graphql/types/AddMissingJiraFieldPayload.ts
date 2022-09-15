import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import JiraDimensionField from './JiraDimensionField'
import makeMutationPayload from './makeMutationPayload'

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
