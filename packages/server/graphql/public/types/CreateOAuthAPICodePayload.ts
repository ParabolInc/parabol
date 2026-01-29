import type {CreateOAuthApiCodePayloadResolvers} from '../resolverTypes'

export type CreateOAuthAPICodePayloadSource = {
  code: string
  state?: string | null
}

const CreateOAuthAPICodePayload: CreateOAuthApiCodePayloadResolvers = {}

export default CreateOAuthAPICodePayload
