import {TierEnum} from '../database/types/Invoice'
import {NewMeetingPhaseTypeEnum} from '../database/types/GenericMeetingPhase'
import isTeamHealthAvailable from 'parabol-client/utils/features/isTeamHealthAvailable'
import {OrganizationFeatureFlagsEnum} from '../graphql/private/resolverTypes'

const isPhaseAvailable =
  (tier: TierEnum, orgFeatureFlags?: string[]) => (phaseType: NewMeetingPhaseTypeEnum) => {
    const typedFeatureFlags = orgFeatureFlags as OrganizationFeatureFlagsEnum | undefined
    if (phaseType === 'TEAM_HEALTH') {
      return isTeamHealthAvailable(tier, typedFeatureFlags?.includes('teamHealth'))
    }
    return true
  }

export default isPhaseAvailable
