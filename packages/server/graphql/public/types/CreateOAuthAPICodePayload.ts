import {CreateOAuthAPICodePayloadResolvers} from '../resolverTypes'

export type CreateOAuthAPICodePayloadSource = {
  code: string
  redirectUri: string
  state?: string | null
}

const CreateOAuthAPICodePayload: CreateOAuthAPICodePayloadResolvers = {
  code: ({code}) => code,
  redirectUri: ({redirectUri}) => redirectUri,
  state: ({state}) => state ?? null
}

export default CreateOAuthAPICodePayload
