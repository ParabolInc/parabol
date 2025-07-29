import type {ReactjiDB} from '../../postgres/types'
import {getUserId} from '../../utils/authorization'
import getGroupedReactjis from '../../utils/getGroupedReactjis'
import type {GQLContext} from './../graphql'

const resolveReactjis = (
  {reactjis, id}: {reactjis: ReactjiDB[]; id: string},
  _args: unknown,
  {authToken}: GQLContext
) => {
  const viewerId = getUserId(authToken)
  return getGroupedReactjis(reactjis, viewerId, id)
}

export default resolveReactjis
