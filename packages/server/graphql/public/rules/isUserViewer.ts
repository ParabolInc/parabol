import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'

const isUserViewer = rule({cache: 'strict'})(
  async ({id: userId}, _args, {authToken}: GQLContext) => {
    const viewerId = getUserId(authToken)
    return userId === viewerId ? true : new GraphQLError('Must be logged in as user')
  }
)

export default isUserViewer
