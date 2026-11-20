import type {Oauthclienttypeenum} from '../../../postgres/types/pg'

const OAuthClientTypeEnum: Record<string, Oauthclienttypeenum> = {
  CONFIDENTIAL: 'confidential',
  PUBLIC: 'public'
}

export default OAuthClientTypeEnum
