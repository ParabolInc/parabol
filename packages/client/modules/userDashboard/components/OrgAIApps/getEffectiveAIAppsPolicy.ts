import type {OrgAIAppsPolicyEnum} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'

const getEffectiveAIAppsPolicy = (
  aiAppsPolicy: OrgAIAppsPolicyEnum | null | undefined,
  useAI: boolean
): OrgAIAppsPolicyEnum => aiAppsPolicy ?? (useAI ? 'ALL' : 'NONE')

export default getEffectiveAIAppsPolicy
