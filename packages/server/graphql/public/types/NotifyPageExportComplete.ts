import type {NotifyPageExportCompleteResolvers} from '../resolverTypes'

const NotifyPageExportComplete: NotifyPageExportCompleteResolvers = {
  __isTypeOf: ({type}) => type === 'PAGE_EXPORT_COMPLETE',

  pageExport: ({pageExportId}, _args, {dataLoader}) =>
    dataLoader.get('pageExports').loadNonNull(pageExportId)
}

export default NotifyPageExportComplete
