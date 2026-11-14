import type {ExportPagesToConfluenceSuccessResolvers} from '../resolverTypes'

export type ExportPagesToConfluenceSuccessSource = {pageExportId: string}

const ExportPagesToConfluenceSuccess: ExportPagesToConfluenceSuccessResolvers = {
  pageExport: ({pageExportId}, _args, {dataLoader}) =>
    dataLoader.get('pageExports').loadNonNull(pageExportId)
}

export default ExportPagesToConfluenceSuccess
