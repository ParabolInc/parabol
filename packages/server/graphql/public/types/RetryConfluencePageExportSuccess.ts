import type {RetryConfluencePageExportSuccessResolvers} from '../resolverTypes'

export type RetryConfluencePageExportSuccessSource = {pageExportId: string}

const RetryConfluencePageExportSuccess: RetryConfluencePageExportSuccessResolvers = {
  pageExport: ({pageExportId}, _args, {dataLoader}) =>
    dataLoader.get('pageExports').loadNonNull(pageExportId)
}

export default RetryConfluencePageExportSuccess
