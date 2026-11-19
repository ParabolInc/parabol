import type {OrgAIAppsPolicyEnum} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'

const isAIAppGrantBlocked = (
  effectivePolicy: OrgAIAppsPolicyEnum,
  clientVerifiedAt: string | null | undefined
) => !(effectivePolicy === 'ALL' || (effectivePolicy === 'VERIFIED' && !!clientVerifiedAt))

export default isAIAppGrantBlocked
