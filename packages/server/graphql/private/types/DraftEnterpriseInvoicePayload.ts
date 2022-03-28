import {DraftEnterpriseInvoicePayloadResolvers} from '../resolverTypes'

export type DraftEnterpriseInvoicePayloadSource =
  | {
      orgId: string
    }
  | {error: {message: string}}

const DraftEnterpriseInvoicePayload: DraftEnterpriseInvoicePayloadResolvers = {
  organization: (source, _args, {dataLoader}) => {
    return 'orgId' in source ? dataLoader.get('organizations').load(source.orgId) : null
  }
}

export default DraftEnterpriseInvoicePayload
