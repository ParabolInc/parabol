import {licensePublicKeys} from './licensePublicKeys'
import {parseLicenseKey} from './licenseToken'

/*
The instance's license, read from LICENSE_KEY once when the process starts. A license is for the whole instance, not an
organization. One without `saas` makes this an enterprise instance, as IS_ENTERPRISE used to: new organizations start on
Enterprise, IS_SINGLE_ORG can apply, and admins can download signed usage reports. Parabol's cloud has a `saas` license,
which only keeps its organizations without a Stripe subscription on their paid tier.
*/

const instanceLicense = parseLicenseKey(
  process.env.LICENSE_KEY,
  licensePublicKeys,
  process.env.HOST
)

export const getInstanceLicense = () => instanceLicense

/** Whether a valid license, expired or not, makes this an enterprise instance rather than Parabol's cloud */
export const isEnterpriseInstance = () =>
  instanceLicense.parsed.ok && !instanceLicense.parsed.claims.saas

/** Whether new organizations can't be created: IS_SINGLE_ORG, on an enterprise instance */
export const isSingleOrgInstance = () =>
  process.env.IS_SINGLE_ORG === 'true' && isEnterpriseInstance()
