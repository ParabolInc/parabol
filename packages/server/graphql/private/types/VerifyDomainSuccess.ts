import {VerifyDomainSuccessResolvers} from '../resolverTypes'

export type VerifyDomainSuccessSource = {
  samlId: string
}

const VerifyDomainSuccess: VerifyDomainSuccessResolvers = {
  saml: async ({samlId}, _args, {dataLoader}) => {
    return dataLoader.get('saml').loadNonNull(samlId)
  }
}

export default VerifyDomainSuccess
