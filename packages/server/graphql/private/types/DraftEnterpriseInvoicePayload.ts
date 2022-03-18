import { DraftEnterpriseInvoicePayloadResolvers } from '../resolverTypes'

export type DraftEnterpriseInvoicePayloadSource = any

const DraftEnterpriseInvoicePayload: DraftEnterpriseInvoicePayloadResolvers = {
    organization: ({orgId}, _args, {
      dataLoader
    }) => {
      return dataLoader.get('organizations').load(orgId)
    }
}

export default DraftEnterpriseInvoicePayload