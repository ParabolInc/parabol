import type {PageExportProgressPayloadResolvers} from '../resolverTypes'

export type PageExportProgressPayloadSource = {pageExportId: string}

const PageExportProgressPayload: PageExportProgressPayloadResolvers = {
  pageExport: ({pageExportId}, _args, {dataLoader}) =>
    dataLoader.get('pageExports').loadNonNull(pageExportId)
}

export default PageExportProgressPayload
