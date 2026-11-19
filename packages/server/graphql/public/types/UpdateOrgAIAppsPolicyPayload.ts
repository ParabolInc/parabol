import type {UpdateOrgAiAppsPolicyPayloadResolvers} from '../resolverTypes'

export type UpdateOrgAIAppsPolicyPayloadSource = {
  orgId: string
}

const UpdateOrgAIAppsPolicyPayload: UpdateOrgAiAppsPolicyPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default UpdateOrgAIAppsPolicyPayload
