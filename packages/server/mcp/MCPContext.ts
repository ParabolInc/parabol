import type {APIGrant} from '../utils/getAPIGrant'

export interface MCPContext {
  authorization: string
  ip: string
  grant: APIGrant
}
