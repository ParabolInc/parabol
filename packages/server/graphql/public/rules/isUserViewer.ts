import {rule} from 'graphql-shield'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

const isUserViewer = rule({cache: 'strict'})(
  async ({id: userId}, _args, {authToken}: GQLContext) => {
    const viewerId = getUserId(authToken)
    return userId === viewerId ? true : new Error('Must be logged in as user')
  }
)

export default isUserViewer
