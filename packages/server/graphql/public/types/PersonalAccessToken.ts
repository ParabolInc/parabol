import type {ReqResolvers} from './ReqResolvers'

const PersonalAccessToken: ReqResolvers<'PersonalAccessToken'> = {
  id: ({prefix}) => `pat_${prefix}`
}

export default PersonalAccessToken
