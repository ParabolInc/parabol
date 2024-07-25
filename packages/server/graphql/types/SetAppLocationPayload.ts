import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import User from './User'
import makeMutationPayload from './makeMutationPayload'

export const SetAppLocationSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetAppLocationSuccess',
  fields: () => ({
    user: {
      type: new GraphQLNonNull(User),
      description: 'the user with the updated location',
      resolve: async ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const SetAppLocationPayload = makeMutationPayload('SetAppLocationPayload', SetAppLocationSuccess)

export default SetAppLocationPayload
