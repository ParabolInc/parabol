import type {CreateOAuthApiCodePayloadResolvers} from '../resolverTypes'

// Defines the source type for the payload, matching the structure returned by the mutation
export type CreateOAuthAPICodePayloadSource = {
  code: string
  redirectUri: string
  state?: string | null
}

// 1:1 mapping resolvers are unnecessary if source matches schema.
// However, we strictly type the source here.
// Assuming default resolvers work, we can likely remove this file's logic
// or keep it minimal if the codebase structure requires a file per type.
// The user asked to "Refactor and simplify this".
// Since it's 1:1, we can just remove the explicit resolver properties if the type mapping handles it.
// usage of CreateOAuthApiCodePayloadResolvers implies we might need to export *something*.
// If I just export the type and let the resolver be empty/undefined in the merger?
// Or just return the source as is.

// Let's just remove the explicit field resolvers.
const CreateOAuthAPICodePayload: CreateOAuthApiCodePayloadResolvers = {}

export default CreateOAuthAPICodePayload
