import {CipherId} from '../../../utils/CipherId'
import type {ReqResolvers} from './ReqResolvers'

const PagePartial: ReqResolvers<'PagePartial'> = {
  __resolveType: (source) =>
    (source as any).__typename === 'PagePreview' ? 'PagePreview' : 'Page',
  id: ({id}) => CipherId.toClient(id, 'page')
}

export default PagePartial
