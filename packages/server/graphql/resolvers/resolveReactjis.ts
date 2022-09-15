import Reactji from '../../database/types/Reactji'
import {getUserId} from '../../utils/authorization'
import getGroupedReactjis from '../../utils/getGroupedReactjis'
import {GQLContext} from './../graphql'

const resolveReactjis = (
  {reactjis, id}: {reactjis: Reactji[]; id: string},
  _args: unknown,
  {authToken}: GQLContext
) => {
  const viewerId = getUserId(authToken)
  return getGroupedReactjis(reactjis, viewerId, id)
}

export default resolveReactjis
