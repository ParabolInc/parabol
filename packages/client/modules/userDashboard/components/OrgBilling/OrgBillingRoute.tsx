import OrgPlansAndBillingRoot from './OrgPlansAndBillingRoot'
import useOrganizationOutlet from './useOrganizationOutlet'

const OrgBillingRoute = () => {
  const {organization} = useOrganizationOutlet()
  return <OrgPlansAndBillingRoot organizationRef={organization} />
}

export default OrgBillingRoute
