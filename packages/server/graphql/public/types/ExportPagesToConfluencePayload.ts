import type {ExportPagesToConfluencePayloadResolvers} from '../resolverTypes'

export type ExportPagesToConfluencePayloadSource = {pageExportId: string}

const ExportPagesToConfluencePayload: ExportPagesToConfluencePayloadResolvers = {
  pageExport: ({pageExportId}, _args, {dataLoader}) =>
    dataLoader.get('pageExports').loadNonNull(pageExportId)
}

export default ExportPagesToConfluencePayload
