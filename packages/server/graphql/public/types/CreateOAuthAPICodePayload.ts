import {CreateOAuthApiCodePayloadResolvers} from '../resolverTypes'

export type CreateOAuthAPICodePayloadSource = {
  code: string
  redirectUri: string
  state?: string | null
}

const CreateOAuthAPICodePayload: CreateOAuthApiCodePayloadResolvers = {
  code: ({code}: CreateOAuthAPICodePayloadSource) => code,
  redirectUri: ({redirectUri}: CreateOAuthAPICodePayloadSource) => redirectUri,
  state: ({state}: CreateOAuthAPICodePayloadSource) => state ?? null
}

export default CreateOAuthAPICodePayload
