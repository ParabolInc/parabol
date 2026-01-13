import type {CreateOAuthApiCodePayloadResolvers} from '../resolverTypes'

// Defines the source type for the payload, matching the structure returned by the mutation
export type CreateOAuthAPICodePayloadSource = {
  code: string
  state?: string | null
}

const CreateOAuthAPICodePayload: CreateOAuthApiCodePayloadResolvers = {}

export default CreateOAuthAPICodePayload
