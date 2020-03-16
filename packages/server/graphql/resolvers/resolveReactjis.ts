import {getUserId} from '../../utils/authorization'
import getGroupedReactjis from '../../utils/getGroupedReactjis'

const resolveReactjis = ({reactjis, id}, _args, {authToken}) => {
  const viewerId = getUserId(authToken)
  return getGroupedReactjis(reactjis, viewerId, id)
}

export default resolveReactjis
