// import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const AddADOAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddADOAuthSuccess',
  fields: () => ({})
})

const AddADOAuthPayload = makeMutationPayload('AddADOAuthPayload', AddADOAuthSuccess)

export default AddADOAuthPayload
