import type {ReqResolvers} from './ReqResolvers'

const PersonalAccessToken: ReqResolvers<'PersonalAccessToken'> = {
  id: ({prefix}) => prefix
}

export default PersonalAccessToken
