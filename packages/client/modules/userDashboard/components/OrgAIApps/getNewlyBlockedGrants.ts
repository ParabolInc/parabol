import type {OrgAIAppsPolicyEnum} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'
import isAIAppGrantBlocked from './isAIAppGrantBlocked'

const getNewlyBlockedGrants = <T extends {clientVerifiedAt: string | null | undefined}>(
  grants: readonly T[],
  currentPolicy: OrgAIAppsPolicyEnum,
  nextPolicy: OrgAIAppsPolicyEnum
) =>
  grants.filter(
    ({clientVerifiedAt}) =>
      !isAIAppGrantBlocked(currentPolicy, clientVerifiedAt) &&
      isAIAppGrantBlocked(nextPolicy, clientVerifiedAt)
  )

export default getNewlyBlockedGrants
