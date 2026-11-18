import OrgDetails from './OrgDetails'
import useOrganizationOutlet from './useOrganizationOutlet'

const OrgSettingsRoute = () => {
  const {organization} = useOrganizationOutlet()
  return <OrgDetails organizationRef={organization} />
}

export default OrgSettingsRoute
