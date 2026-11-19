import type {Orgaiappspolicyenum} from '../../../postgres/types/pg'

const OrgAIAppsPolicyEnum: Record<string, Orgaiappspolicyenum> = {
  ALL: 'all',
  VERIFIED: 'verified',
  NONE: 'none'
}

export default OrgAIAppsPolicyEnum
