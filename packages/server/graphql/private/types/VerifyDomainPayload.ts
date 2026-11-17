import type {VerifyDomainPayloadResolvers} from '../resolverTypes'

export type VerifyDomainPayloadSource = {
  samlId: string
}

const VerifyDomainPayload: VerifyDomainPayloadResolvers = {
  saml: async ({samlId}, _args, {dataLoader}) => {
    return dataLoader.get('saml').loadNonNull(samlId)
  }
}

export default VerifyDomainPayload
