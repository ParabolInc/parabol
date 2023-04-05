import {NotifyPromptToJoinOrgResolvers} from '../resolverTypes'

const NotifyPromptToJoinOrg: NotifyPromptToJoinOrgResolvers = {
  __isTypeOf: ({type}) => type === 'PROMPT_TO_JOIN_ORG'
}

export default NotifyPromptToJoinOrg
