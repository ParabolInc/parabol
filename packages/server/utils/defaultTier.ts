import {isEnterpriseInstance} from '../license/instanceLicense'

// an enterprise instance's organizations start on Enterprise; Parabol's cloud's start on Starter
export const defaultTier = isEnterpriseInstance() ? 'enterprise' : 'starter'
