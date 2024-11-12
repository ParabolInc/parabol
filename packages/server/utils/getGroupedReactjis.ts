import ReactjiId from 'parabol-client/shared/gqlIds/ReactjiId'
import {ReactjiSource} from '../graphql/public/types/Reactji'
import {ReactjiDB} from '../postgres/types'

const getGroupedReactjis = (reactjis: ReactjiDB[], viewerId: string, idPrefix: string) => {
  const agg = {} as {[key: string]: ReactjiSource}
  reactjis.forEach((reactji) => {
    const {id, userId} = reactji
    const guid = ReactjiId.join(idPrefix, id)
    const isViewerReactji = viewerId === userId
    const record = agg[guid]
    if (!record) {
      agg[guid] = {id: guid, count: 1, isViewerReactji, userIds: [userId]}
    } else {
      record.count++
      record.isViewerReactji = record.isViewerReactji || isViewerReactji
      record.userIds = [userId, ...record.userIds]
    }
  })
  return Object.values(agg)
}

export default getGroupedReactjis
